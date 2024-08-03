export class Request {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private decoder: TextDecoder;
  public method?: string;
  public target?: {
    url?: URL;
    hostname: string;
    port: number;
  };

  public headers: Headers;
  public body?: ReadableStream<Uint8Array> | Uint8Array;

  constructor(reader: ReadableStreamDefaultReader<Uint8Array>) {
    this.reader = reader;
    this.decoder = new TextDecoder();
    this.headers = new Headers();
  }

  public async parse() {
    const firstPackage = (await this.reader.read()).value;
    if (!firstPackage) {
      return;
    }

    const [headerRaw, firstBody] = splitWithEnd(firstPackage);

    const headText = this.decoder.decode(headerRaw).trimEnd();
    const headLines = headText.split("\r\n");
    const [method, target, _] = headLines[0].split(" ");
    this.method = method;

    for (let i = 1; i < headLines.length; i++) {
      const [name, value] = headLines[i].split(": ");
      this.headers.append(name, value);
    }

    if (method === "CONNECT") {
      const url = new URL(`a://${target}`);
      this.target = { hostname: url.hostname, port: Number(url.port) };
      return this;
    }

    const url = new URL(target);
    this.target = {
      url,
      hostname: url.hostname,
      port: Number(url.port) || 80,
    };

    if (method === "POST") {
      if (this.headers.has("Content-Length")) {
        const contentLength = Number(this.headers.get("Content-Length"));

        let buffer = new Uint8Array(firstBody);

        while (buffer.length < contentLength) {
          const { value } = await this.reader.read();

          if (!value) {
            throw new Error(
              `Expected ${contentLength} bytes, but received ${buffer.length} bytes in total`,
            );
          }

          const newBuffer = new Uint8Array(buffer.length + value.length);
          newBuffer.set(buffer);
          newBuffer.set(value, buffer.length);
          buffer = newBuffer;
        }
        this.body = buffer;
      } else if (this.headers.has("Transfer-Encoding")) {
        const type = this.headers.get("Transfer-Encoding");
        switch (type) {
          case "chunked":
            this.body = createCombinedReadableStream(
              firstBody,
              this.reader,
            );
            break;

          default:
            throw new Error(
              `Unsupported Transfer-Encoding: ${type} from Client`,
            );
        }
      }
    }
    return this;
  }
}

class CombinedReadableStreamSource {
  readableStreamReader: ReadableStreamDefaultReader<Uint8Array>;
  firstBody: Uint8Array;
  constructor(
    uint8Array: Uint8Array,
    readableStreamReader: ReadableStreamDefaultReader<Uint8Array>,
  ) {
    this.readableStreamReader = readableStreamReader;
    this.firstBody = uint8Array;
  }

  async start(controller: ReadableStreamDefaultController) {
    let blockToBeProcessed: Uint8Array;
    if (this.firstBody.length === 0) {
      const { done, value } = await this.readableStreamReader.read();

      if (value) {
        blockToBeProcessed = value;
      } else {
        controller.error("Unexpected EOF");
        return;
      }
      if (done) return controller.close();
    } else {
      blockToBeProcessed = this.firstBody;
    }

    while (true) {
      const { blockSize, data } = separateData(
        blockToBeProcessed,
      );

      if (blockSize === 0) {
        return controller.close();
      }

      switch (true) {
        case data.length - 2 < blockSize:
          {
            const { done, value } = await this.readableStreamReader.read();
            if (value) {
              blockToBeProcessed = concat(blockToBeProcessed, value);
            } else {
              controller.error("Unexpected EOF");
              return;
            }
            if (done) return controller.close();
          }
          break;

        case data.length - 2 > blockSize:
          {
            const completedBlock = data.subarray(
              0,
              blockSize,
            );

            controller.enqueue(completedBlock);
            const remainedData = data.subarray(blockSize + 2);
            blockToBeProcessed = remainedData;
          }
          break;

        case data.length - 2 === blockSize:
          {
            controller.enqueue(data);
            const { done, value } = await this.readableStreamReader.read();
            if (value) {
              blockToBeProcessed = concat(this.firstBody, value);
            } else {
              controller.error("Unexpected EOF");
              return;
            }
            if (done) return controller.close();
          }
          break;
      }
    }
  }

  async cancel(reason: unknown) {
    await this.readableStreamReader.cancel(reason);
  }
}

export function createCombinedReadableStream(
  uint8Array: Uint8Array,
  readableStreamReader: ReadableStreamDefaultReader<Uint8Array>,
) {
  const combinedSource = new CombinedReadableStreamSource(
    uint8Array,
    readableStreamReader,
  );
  const combinedStream = new ReadableStream(combinedSource);
  return combinedStream;
}

function splitWithEnd(uint8Array: Uint8Array) {
  const sequence = [13, 10, 13, 10];
  const sequenceLength = sequence.length;
  const arrayLength = uint8Array.length;

  let endIndex = -1;

  for (let i = 0; i < arrayLength; i++) {
    if (uint8Array[i] === sequence[0]) {
      let found = true;
      for (let j = 1; j < sequenceLength; j++) {
        if (uint8Array[i + j] !== sequence[j]) {
          found = false;
          break;
        }
      }
      if (found) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) {
    return [uint8Array, new Uint8Array(0)];
  } else {
    const beforeSequence = uint8Array.subarray(0, endIndex);
    const afterSequence = uint8Array.subarray(endIndex + sequenceLength);
    return [beforeSequence, afterSequence];
  }
}

function uint8ArrayToDecimal(uint8Array: Uint8Array) {
  const decoder = new TextDecoder();
  const hexNumber = decoder.decode(uint8Array);
  const decimalNumber = parseInt(hexNumber, 16);
  return decimalNumber;
}

function concat(buffer: Uint8Array, chunk: Uint8Array) {
  const a = new Uint8Array(buffer.length + chunk.length);
  a.set(buffer);
  a.set(chunk, buffer.length);
  return a;
}

function separateData(block: Uint8Array) {
  const blockSizeLength = block.findIndex((v, i, a) =>
    v === 13 && a[i + 1] === 10
  );

  const blockSize = uint8ArrayToDecimal(block.subarray(0, blockSizeLength));
  const data = block.subarray(blockSizeLength + 2);
  return { blockSize, data };
}
