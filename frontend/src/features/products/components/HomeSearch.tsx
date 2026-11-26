import { XIcon } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SectionCtaLink from '@/components/home/SectionCtaLink';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';
import LoadingStatus from '@/components/ui/LoadingStatus';
import RetryButton from '@/components/ui/RetryButton';
import StateMessage from '@/components/ui/StateMessage';
import Tooltip from '@/components/ui/Tooltip';
import useProductGroupsSearch from '@/features/products/hooks/useProductGroupsSearch';
import { MIN_SEARCH_QUERY_LENGTH } from '@/features/products/schemas';

import DropdownProductGroup from './DropdownProductGroup';
import DropdownProductGroupSkeleton from './DropdownProductGroupSkeleton';

const SKELETON_SEARCH_ROWS = 3;

export default function HomeSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showLengthHint, setShowLengthHint] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const query = searchQuery.trim();
  const isLongEnough = query.length >= MIN_SEARCH_QUERY_LENGTH;
  const compareUrl = `/compare?q=${encodeURIComponent(query)}`;

  const {
    data: searchedGroups,
    isSuccess,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useProductGroupsSearch(query, isLongEnough);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isLongEnough) {
      setShowLengthHint(true);
      return;
    }
    void navigate(compareUrl);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        resultsRef.current?.querySelector('button')?.focus();
      } else {
        setIsOpen(true);
      }
    }
  };

  const hiddenResultsCount = isSuccess ? searchedGroups.count - searchedGroups.results.length : 0;

  return (
    <div
      className="relative w-full max-w-3xl"
      onBlur={(e) => {
        // Close only when focus leaves the whole search, not when it moves into the results
        if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))) {
          setIsOpen(false);
        }
      }}
    >
      <Card className="relative flex items-center p-2">
        <form
          role="search"
          className="w-full"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            enterKeyHint="search"
            aria-label="Пребарај суплементи"
            placeholder="Пребарај суплементи..."
            value={searchQuery}
            className="border-0 pr-12 pointer-coarse:pr-16"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              setShowLengthHint(false);
            }}
            onFocus={() => {
              setIsOpen(true);
            }}
            // After Escape the input keeps focus, so a click must reopen the results too
            onClick={() => {
              setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
          />
        </form>
        {searchQuery && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Tooltip
              text="Исчисти пребарување"
              placement="top"
            >
              <IconButton
                label="Исчисти пребарување"
                onClick={() => {
                  setSearchQuery('');
                  setShowLengthHint(false);
                }}
              >
                <XIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </Card>

      {showLengthHint && (
        <p
          role="status"
          className="text-text-muted mt-2 text-center text-sm"
        >
          Внесете најмалку {MIN_SEARCH_QUERY_LENGTH} карактери.
        </p>
      )}

      {isOpen && isLongEnough && (
        // tabIndex -1: clicks on the panel keep focus inside, so they don't count as clicking outside
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="border-border bg-surface-raised absolute top-full left-0 z-40 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border p-2 shadow-md transition duration-200 ease-out outline-none motion-reduce:transition-none starting:-translate-y-1 starting:opacity-0"
        >
          {isSuccess &&
            searchedGroups.results.map((group) => (
              <DropdownProductGroup
                key={group.id}
                productGroup={group}
              />
            ))}

          {isSuccess && hiddenResultsCount > 0 && (
            <div className="border-border mt-1 border-t pt-2 text-center">
              <SectionCtaLink to={compareUrl}>
                {`Прикажи ги сите ${String(searchedGroups.count)} суплементи`}
              </SectionCtaLink>
            </div>
          )}

          {isSuccess && searchedGroups.results.length === 0 && (
            <StateMessage
              variant="empty"
              message={`Нема суплементи за „${query}“. Пробајте со друг збор или со паметното пребарување.`}
            />
          )}

          {isPending && (
            <>
              <LoadingStatus />
              {Array.from({ length: SKELETON_SEARCH_ROWS }, (_, index) => (
                <DropdownProductGroupSkeleton key={index} />
              ))}
            </>
          )}

          {isError && (
            <StateMessage variant="error">
              <RetryButton
                onRetry={() => {
                  void refetch();
                }}
                isRetrying={isFetching}
              />
            </StateMessage>
          )}
        </div>
      )}
    </div>
  );
}
