declare module 'minimal-password-prompt' {
  function prompt(message: string): Promise<string>;
  export default prompt;
}
