/**
 * Abstracts writing to streams
 */

/** Writes an array of lines to a stream */
export function writeLines(stream: NodeJS.WriteStream, lines: string[]): void {
  for (const line of lines) {
    stream.write(line + '\n');
  }
}

/** Writes a raw string to a stream */
export function writeRaw(stream: NodeJS.WriteStream, data: string): void {
  stream.write(data);
}
