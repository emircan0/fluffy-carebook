import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExpense } from '../expenses';

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, expenseId }: { petId: string; expenseId: string }) => 
      deleteExpense(petId, expenseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.petId] });
    },
  });
}
