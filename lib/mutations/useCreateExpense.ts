import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense, type CreateExpenseInput } from '../expenses';

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => createExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.petId] });
    },
  });
}
