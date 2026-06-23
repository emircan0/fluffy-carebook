import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExpense, type UpdateExpenseInput } from '../expenses';

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpenseInput) => updateExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.petId] });
    },
  });
}
