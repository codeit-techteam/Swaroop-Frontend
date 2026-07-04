import { zodResolver } from '@hookform/resolvers/zod';
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

type ZodFormSchema<TFieldValues extends FieldValues> = z.ZodType<TFieldValues, TFieldValues>;

export const createFormResolver = <TFieldValues extends FieldValues>(
  schema: ZodFormSchema<TFieldValues>,
): Resolver<TFieldValues> => zodResolver(schema) as Resolver<TFieldValues>;

export const useZodForm = <TFieldValues extends FieldValues>(
  schema: ZodFormSchema<TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
    defaultValues?: DefaultValues<TFieldValues>;
  },
): UseFormReturn<TFieldValues> =>
  useForm<TFieldValues>({
    ...options,
    resolver: createFormResolver(schema),
  });

export { zodResolver };
