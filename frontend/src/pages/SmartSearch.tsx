import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import SmartSearchResultsModal from '@/features/products/components/SmartSearchResultsModal';
import useSmartSearchProductGroups from '@/features/products/hooks/useSmartSearchProductGroups';
import { type SmartSearchFormFields, SmartSearchSchema } from '@/features/products/schemas';

export default function SmartSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const smartSearch = useSmartSearchProductGroups();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SmartSearchFormFields>({
    resolver: zodResolver(SmartSearchSchema),
    defaultValues: { query: '' },
  });

  const inputSearchQuery = watch('query');

  const onSubmit = (data: SmartSearchFormFields) => {
    smartSearch.mutate({ query: data.query });
    setIsModalOpen(true);
  };

  const handleResultsModalOnClose = () => {
    setIsModalOpen(false);
    reset();
    smartSearch.reset();
  };

  return (
    <div className="flex flex-col items-center">
      <Section>
        <h1 className="text-text mx-auto max-w-2xl text-center text-lg font-semibold sm:text-xl md:text-2xl">
          Опишете ја вашата цел, а паметниот асистент ќе ги пронајде најдобрите суплементи за вас.
        </h1>
      </Section>

      <Section>
        <Card className="mx-auto w-full max-w-3xl p-3">
          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <div className="flex w-full items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Опишете ја вашата цел ... (пр., посилен имунитет)"
                  maxLength={100}
                  className="pr-11"
                  {...register('query')}
                />

                {inputSearchQuery && (
                  <div className="absolute top-1/2 right-2 -translate-y-1/2">
                    <Tooltip text="Исчисти пребарување">
                      <IconButton
                        label="Исчисти пребарување"
                        size="sm"
                        onClick={() => {
                          reset();
                        }}
                      >
                        <XIcon className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>

              <Tooltip text="Пребарувај">
                <IconButton
                  label="Пребарувај"
                  variant="filled"
                  type="submit"
                >
                  <SearchIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            </div>

            {errors.query?.message && (
              <p className="text-danger mt-2 px-1 text-sm font-medium">{errors.query.message}</p>
            )}
          </form>
        </Card>
      </Section>

      <Section>
        <p className="text-text-muted mx-auto max-w-lg text-center text-sm">
          Оваа функционалност е само за информативни цели и не дијагностицира ниту лекува медицински
          состојби. Секогаш консултирајте се со здравствен работник пред да започнете со употреба на
          каков било суплемент.
        </p>
      </Section>

      {isModalOpen && (
        <SmartSearchResultsModal
          query={smartSearch.variables?.query ?? ''}
          groups={smartSearch.data ?? []}
          isPending={smartSearch.isPending}
          isError={smartSearch.isError}
          onClose={handleResultsModalOnClose}
        />
      )}
    </div>
  );
}
