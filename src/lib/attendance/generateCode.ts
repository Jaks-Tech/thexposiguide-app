export function generateCode(length: number = 6): string {
  let code = "";

  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }

  return code;
}