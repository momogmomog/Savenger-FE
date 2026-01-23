export interface CreateTransferTransactionPayload {
  transferId: number;
  amount: number;
  sourceComment: string | null;
  receiverComment: string | null;
  sourceCategoryId: number;
  receiverCategoryId: number;
}
