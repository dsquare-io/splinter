import {
  Button,
  Dialog,
  Heading,
  Label,
  Modal,
  ModalOverlay,
  OverlayTriggerStateContext,
  Tag,
  TagGroup,
  TagList
} from "react-aria-components";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {useContext} from "react";
import {Command} from 'cmdk';
import {useListData} from "react-stately";
import {useApiQuery} from "@/hooks/useApiQuery.ts";
import {ApiRoutes} from "@/api-types";

function CloseButton() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
     <button
        onClick={() => state.close()}
        className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
     >
       <XMarkIcon className="size-5"/>
     </button>
  );
}

export function AddExpense() {
  const selectedItems = useListData<any>({initialItems: []});
  const {data: friendsData} = useApiQuery(ApiRoutes.FRIEND_LIST);
  const {data: groupsData} = useApiQuery(ApiRoutes.GROUP_LIST);

  return (
     <ModalOverlay isDismissable>
       <Modal>
         <Dialog className="focus:outline-none">
           <div>
             <Heading slot="title">Add Expense</Heading>
             <CloseButton/>
           </div>

           <Command>
             <TagGroup
                selectionMode="none"
                className="react-aria-TagGroup flex flex-wrap gap-x-2"
                onRemove={(keys) => {
                  selectedItems.remove(...keys);
                }}
             >
               <Label className="text-sm text-gray-600">With you and:</Label>

               <TagList items={selectedItems.items} className="react-aria-TagList contents">
                 {(item) => (
                    <Tag className="react-aria-Tag shrink-0">
                      {item.name}
                      <Button slot="remove"><XMarkIcon className="size-4"/></Button>
                    </Tag>
                 )}
               </TagList>

               <Command.Input className="min-w-[100px] grow"/>
             </TagGroup>

             <Command.List>
               <Command.Group heading="Groups">
                 {friendsData?.results?.map((friend) => (
                    <Command.Item
                       onSelect={() => {
                         selectedItems.append({id: friend.uid, type: 'friend', name: friend.name})
                       }}
                    >{friend.name}</Command.Item>
                 ))}
               </Command.Group>

               <Command.Group heading="Friends">
                 {groupsData?.results?.map((group) => (
                    <Command.Item
                       onSelect={() => {
                         selectedItems.append({id: group.publicId, type: 'group', name: group.name})
                       }}
                    >{group.name}</Command.Item>
                 ))}
               </Command.Group>
             </Command.List>
           </Command>
         </Dialog>
       </Modal>
     </ModalOverlay>
  );
}