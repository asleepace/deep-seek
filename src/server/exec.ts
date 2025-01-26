/**
 *  ## exec(command)
 *
 *  Execute a command in the shell and return the output.
 *
 */
export async function exec(command: string) {
  const childProcess = Bun.spawn({
    cmd: command.split(" "),
    stdout: "pipe",
  });
  return await new Response(childProcess.stdout).text();
}
