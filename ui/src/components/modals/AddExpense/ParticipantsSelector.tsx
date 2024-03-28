import {useEffect, useReducer, useRef, useState} from 'react';
import {
  Button as BaseButton,
  Collection,
  ComboBox,
  Header,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Button as RACButton,
  Section,
  Tag,
  TagGroup,
  TagList,
} from 'react-aria-components';
import {useFormContext} from 'react-hook-form';

import {ChevronDownIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {useParams} from '@tanstack/react-router';

import {Friend, Group} from '@/api-types/components/schemas';
import {Paths} from '@/api-types/routePaths.ts';
import {Avatar} from '@/components/common';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

import {type Participant} from './useExpenseParticipants';

type participantsAction =
  | {type: 'select_group'; data: Group}
  | {type: 'select_friend'; data: Friend}
  | {
      type: 'remove';
      urn: string;
    };

function participantsReducer(state: Participant[], action: participantsAction): Participant[] {
  if (action.type === 'remove') {
    return state.filter((p) => p.urn !== action.urn);
  }

  if (action.type === 'select_group') {
    return [{...action.data, type: 'group', id: action.data.urn}] satisfies Participant[];
  }
  if (action.type === 'select_friend' && state[0]?.type === 'group') {
    return [
      {
        ...action.data,
        name: action.data.fullName!,
        type: 'friend',
        id: action.data.urn,
      },
    ] satisfies Participant[];
  }
  if (action.type === 'select_friend') {
    return [
      ...state,
      {
        ...action.data,
        name: action.data.fullName!,
        type: 'friend',
        id: action.data.urn,
      },
    ] satisfies Participant[];
  }
  throw Error('Unknown action.');
}

export default function ParticipantsSelector() {
  const params = useParams({strict: false});
  const {setValue} = useFormContext();

  const triggerRef = useRef<HTMLDivElement>(null);
  const {data: groups} = useApiQuery(Paths.GROUP_LIST);
  const {data: friends} = useApiQuery(Paths.FRIEND_LIST);

  const [selectedParticipants, dispatch] = useReducer(participantsReducer, [] as Participant[]);
  useEffect(() => {
    setValue('del:participants', selectedParticipants);
  }, [setValue, selectedParticipants]);

  const [fieldState, setFieldState] = useState({
    selectedKey: null,
    inputValue: '',
  });

  const onInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === '' ? null : prevState.selectedKey,
    }));
  };

  useEffect(() => {
    const friend = friends?.results?.find((f) => f.uid === (params as {friend: string}).friend);
    const group = groups?.results?.find((g) => g.uid === (params as {group: string}).group);

    if (friend) {
      dispatch({type: 'select_friend', data: friend});
    } else if (group) {
      dispatch({type: 'select_group', data: group});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!groups?.results || !friends?.results) return;

  const comboboxItems = [
    {name: 'Groups', children: groups.results},
    {name: 'Friends', children: friends.results},
  ] as const;

  return (
    <div
      ref={triggerRef}
      className="-mx-4 border-b border-t border-neutral-300 px-4 py-2 sm:-mx-6 sm:px-6"
    >
      <ComboBox
        className="flex flex-wrap items-center gap-x-2 gap-y-1"
        aria-label="participants"
        defaultItems={comboboxItems}
        selectedKey={fieldState.selectedKey}
        inputValue={fieldState.inputValue}
        onInputChange={onInputChange}
        onSelectionChange={(key) => {
          const friend = friends?.results?.find((f) => f.urn === key);
          const group = groups?.results?.find((g) => g.urn === key);

          if (friend) {
            dispatch({type: 'select_friend', data: friend});
          } else if (group) {
            dispatch({type: 'select_group', data: group});
          }

          setFieldState({
            selectedKey: null,
            inputValue: '',
          });
        }}
      >
        <Label className="shrink-0 text-sm text-gray-600">With you and:</Label>
        <TagGroup
          selectionMode="none"
          aria-label="Participants"
          className="react-aria-TagGroup contents"
          onRemove={(keys) => {
            keys.forEach((key) => dispatch({type: 'remove', urn: key.toString()}));
          }}
        >
          <TagList
            items={selectedParticipants}
            className="react-aria-TagList contents"
          >
            {(item) => (
              <Tag
                textValue={item.name}
                className="react-aria-Tag flex shrink-0 cursor-default items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 text-sm text-neutral-700 focus:outline-none data-[focused]:border-brand-300 data-[focused]:bg-brand-100 [&[data-focused]_span]:bg-brand-100 [&[data-focused]_span]:ring-brand-300"
              >
                <Avatar
                  className="size-6 rounded-none bg-neutral-50"
                  fallback={item.name}
                />
                {item.name}
                <RACButton
                  className="-ml-2 px-2 py-1 text-neutral-800 focus:outline-none"
                  slot="remove"
                >
                  <XMarkIcon className="size-4" />
                </RACButton>
              </Tag>
            )}
          </TagList>
        </TagGroup>
        <div className="-my-1 flex min-w-[100px] grow items-center">
          <Input
            placeholder="Search friends or groups..."
            className="grow py-1.5 focus:outline-none"
            onKeyDown={() => {}}
          />
          <BaseButton className="flex items-center rounded-r-md py-2.5 focus:outline-none">
            <ChevronDownIcon
              className="size-4 text-gray-500"
              aria-hidden="true"
            />
          </BaseButton>
        </div>

        <Popover
          crossOffset={16}
          triggerRef={triggerRef}
          className="react-aria-Popover w-[min(464px,100vw)] overflow-y-auto"
        >
          <ListBox className="react-aria-ListBox -mx-3 -my-4">
            {(section: (typeof comboboxItems)[number]) => (
              <Section id={section.name}>
                <Header>{section.name}</Header>
                <Collection items={section.children as (Friend | Group)[]}>
                  {(item) => (
                    <ListBoxItem
                      id={item.urn}
                      textValue={(item as Friend).fullName ?? (item as Group).name}
                    >
                      <Avatar
                        className="size-7 bg-neutral-50"
                        fallback={(item as Friend).fullName ?? (item as Group).name}
                      />
                      {(item as Friend).fullName ?? (item as Group).name}
                    </ListBoxItem>
                  )}
                </Collection>
              </Section>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}
