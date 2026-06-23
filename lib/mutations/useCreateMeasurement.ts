import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMeasurement, type CreateMeasurementInput } from '../measurements';

export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeasurementInput) => createMeasurement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', variables.petId] });
    },
  });
}
