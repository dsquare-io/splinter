import {useEffect} from 'react';
import {
  Button as BaseButton,
  ComboBox,
  Dialog,
  Heading,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
  Popover,
  Radio,
  RadioGroup,
} from 'react-aria-components';
import {useForm} from 'react-hook-form';

import {ChevronUpDownIcon} from '@heroicons/react/24/outline';
import {useQuery} from '@tanstack/react-query';
import groupBy from 'just-group-by';

import {Paths} from '@/api-types/routePaths.ts';
import Currency from '@/components/Currency.tsx';
import {
  Avatar,
  Button,
  FieldError,
  Form,
  HiddenField,
  Input,
  Label,
  NumberFormField,
  WatchState,
} from '@/components/common';
import {FormField} from '@/components/common/Form/FormField.tsx';
import {CloseDialog} from '@/components/modals/utils.tsx';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';

interface SettleUpModalProps {
  group_uid?: string;
  friend_uid?: string;
  onOpenChange?: (open: boolean) => void;
}

export function AddPaymentModal({group_uid, friend_uid}: SettleUpModalProps) {
  const formControl = useForm();
  const {data: profileData} = useApiQuery(Paths.PROFILE);
  const {data: preferredCurrency} = useApiQuery(Paths.CURRENCY_PREFERENCE);

  // for single friend
  const {data: friendData} = useQuery(
    apiQueryOptions(Paths.FRIEND_DETAIL, {friend_uid: friend_uid ?? ''}, undefined, {
      enabled: !!friend_uid,
    })
  );

  useEffect(() => {
    if (friend_uid && friendData?.aggregatedOutstandingBalance) {
      const balance = +(friendData.aggregatedOutstandingBalance.amount ?? 0);

      if (balance) {
        formControl.setValue('paymentDir', balance < 0 ? 'out' : 'in');
        formControl.setValue('amount', Math.abs(balance));
      }
    }
  }, [friendData, friend_uid]);

  // for groups
  const {data: groupData} = useQuery(
    apiQueryOptions(Paths.GROUP_DETAIL, {group_uid: group_uid ?? ''}, undefined, {
      enabled: !!group_uid,
    })
  );
  let balanceByUsers = groupBy(groupData?.outstandingBalances ?? [], (balance) => balance.user.uid);
  balanceByUsers = Object.fromEntries(
    Object.entries(balanceByUsers).map(([uId, balances]) => [
      uId,
      balances.filter((balance) => balance.friend.uid === profileData?.uid),
    ])
  );

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Settle Up</Heading>
                <CloseDialog />
              </div>

              <Form
                className="space-y-6"
                control={formControl}
                transformData={(data) => {
                  const paymentDir = data?.paymentDir ?? 'out';
                  const friend = data?.friend ?? '';
                  delete data?.paymentDir;
                  delete data?.friend;
                  return {
                    ...data,
                    ...(paymentDir === 'in'
                      ? {
                          receiver: profileData?.uid,
                          sender: friend_uid ?? friend,
                        }
                      : {
                          sender: profileData?.uid,
                          receiver: friend_uid ?? friend,
                        }),
                  };
                }}
                method="POST"
                action={Paths.PAYMENT}
                onSubmitSuccess={() => {
                  formControl.reset();
                  close();
                }}
              >
                <HiddenField
                  name="currency"
                  value={preferredCurrency?.uid}
                />
                <HiddenField
                  name="datetime:now"
                  value="."
                />
                {group_uid && (
                  <HiddenField
                    name="group"
                    value={group_uid}
                  />
                )}

                <FormField
                  name="paymentDir"
                  defaultValue="out"
                >
                  <RadioGroup
                    className="flex rounded-md bg-gray-200 p-1 text-center"
                    orientation="horizontal"
                    aria-label="Payment direction"
                  >
                    <Radio
                      className="w-full rounded-sm px-3 py-2 text-sm font-medium text-gray-600 data-selected:bg-white data-selected:text-gray-900 data-selected:shadow-xs data-focus-visible:ring-2 data-focus-visible:ring-brand-500"
                      value="out"
                    >
                      I'm Paying
                    </Radio>
                    <Radio
                      className="w-full rounded-sm px-3 py-2 text-sm font-medium text-gray-600 data-selected:bg-white data-selected:text-gray-900 data-selected:shadow-xs data-focus-visible:ring-2 data-focus-visible:ring-brand-500"
                      value="in"
                    >
                      I'm Getting Paid
                    </Radio>
                  </RadioGroup>
                </FormField>

                {friend_uid && (
                  <div className="mt-6">
                    <WatchState name="paymentDir">
                      {(paymentDir) => (
                        <label className="mb-1 block text-sm font-bold leading-relaxed text-gray-800">
                          {paymentDir === 'in' ? 'Who is paying you?' : 'Who is getting Paid?'}
                        </label>
                      )}
                    </WatchState>
                    <div className="flex w-full flex-1 items-center gap-x-2 rounded-md border border-gray-300 bg-white px-4 py-[8px] text-left text-sm">
                      <Avatar
                        className="size-5"
                        fallback={friendData?.fullName}
                      />
                      <span>{friendData?.fullName}</span>
                    </div>
                  </div>
                )}

                {group_uid && (
                  <FormField name="friend">
                    <ComboBox
                      menuTrigger="focus"
                      onSelectionChange={(key) => {
                        let balance = 0;
                        if (key) {
                          balance = +(balanceByUsers[key]?.[0]?.amount ?? 0);
                        }

                        if (balance) {
                          formControl.setValue('paymentDir', balance > 0 ? 'out' : 'in');
                          formControl.setValue('amount', Math.abs(balance));
                        }
                      }}
                    >
                      <WatchState name="paymentDir">
                        {(paymentDir) => (
                          <Label>{paymentDir == 'in' ? 'Who is paying you?' : 'Who is getting Paid?'}</Label>
                        )}
                      </WatchState>
                      <div className="relative">
                        <Input placeholder="Type to search..." />
                        <BaseButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </BaseButton>
                      </div>
                      <Popover className="react-aria-Popover w-(--trigger-width)">
                        <ListBox className="-mx-4 -my-2 text-sm text-gray-900">
                          {groupData?.members
                            ?.filter((e) => e.uid !== profileData?.uid)
                            .map((memeber) => (
                              <ListBoxItem
                                className="flex items-center gap-x-3 px-4 py-2 data-focused:bg-gray-100"
                                key={memeber.uid}
                                textValue={memeber.fullName}
                                id={memeber.uid}
                              >
                                <Avatar
                                  className="size-6 bg-white"
                                  fallback={memeber.fullName}
                                />
                                <div className="flex-1">
                                  <div>{memeber.fullName}</div>
                                  {!memeber.isActive && <div className="text-xs text-gray-600">Inactive</div>}
                                </div>
                                {balanceByUsers[memeber.uid]?.[0] && (
                                  <Currency
                                    currency={balanceByUsers[memeber.uid][0].currency.uid!}
                                    value={+balanceByUsers[memeber.uid][0].amount * -1}
                                  />
                                )}
                              </ListBoxItem>
                            ))}
                        </ListBox>
                      </Popover>
                    </ComboBox>
                  </FormField>
                )}

                <NumberFormField
                  required
                  name="amount"
                  defaultValue={0}
                  formatOptions={{
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                  onBlur={() => {
                    const val = formControl.getValues('amount');
                    const paymentDir = formControl.getValues('paymentDir');
                    if (val < 0) {
                      formControl.setValue('paymentDir', paymentDir === 'in' ? 'out' : 'in');
                      formControl.setValue('val', Math.abs(val));
                    }
                  }}
                >
                  <Label>Amount</Label>
                  <Input type="text" />
                  <FieldError />
                </NumberFormField>

                <div className="-mx-4 flex justify-between px-4 pt-4 sm:-mx-6 sm:px-6">
                  <Button type="submit">Add Payment</Button>
                </div>
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
