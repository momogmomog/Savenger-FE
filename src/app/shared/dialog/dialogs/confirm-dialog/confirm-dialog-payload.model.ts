export class ConfirmDialogPayload {
  constructor(
    public readonly message: string,
    public readonly confirmMessage?: string,
  ) {}
}
