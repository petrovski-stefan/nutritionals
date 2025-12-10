import { useEffect, useState } from 'react';
import type {
  BackendMyListItem,
  BackendMyListWithItems,
  BackendMyListWithItemsCount,
} from '../../types/mylist';
import { MyListService } from '../../api/mylist';
import { useAuthContext } from '../../context/AuthContext';
import MyList from './MyList';
import MyListItem from './MyListItem';
import MYLISTS_TEXT from '../../locale/mylists';
import CreateUpdateMyListModal from './CreateUpdateMyListModal';

type Loading = {
  myLists: boolean;
  products: boolean;
  createUpdateMyList: boolean;
};

const loadingDefaultState: Loading = {
  myLists: false,
  products: false,
  createUpdateMyList: false,
};

type MyListsError = 'unexpectedError' | null;
type ProductsError = 'unexpectedError' | 'client_error' | null;
type CreateUpdateMyListError = 'unexpectedError' | 'myListNameAlreadyUsed' | null;

type Error = {
  myLists: MyListsError;
  products: ProductsError;
  createUpdateMyList: CreateUpdateMyListError;
};

const errorDefaultState: Error = {
  myLists: null,
  products: null,
  createUpdateMyList: null,
};

type EditMyList = Pick<BackendMyListWithItems, 'id' | 'name'>;

export default function MyLists() {
  const [myLists, setMyLists] = useState<BackendMyListWithItemsCount[]>([]);

  const [myListIdToView, setMyListIdToView] = useState<number | null>(null);
  const [myListProductsToView, setMyListProductsToView] = useState<BackendMyListItem[]>([]);

  const [isCreateUpdateMyListModalOpen, setIsCreateUpdateMyListModalOpen] = useState(false);
  const [myListToEdit, setMyListToEdit] = useState<EditMyList | null>(null);

  const [error, setError] = useState<Error>(errorDefaultState);
  const [isLoading, setIsLoading] = useState<Loading>(loadingDefaultState);

  const { accessToken } = useAuthContext();

  useEffect(() => {
    const getMyLists = async () => {
      setIsLoading({ ...isLoading, myLists: true });

      try {
        const response = await MyListService.getMyLists(accessToken);

        if (response.status) {
          setMyLists(response.data);
        }
      } catch (err) {
        setError({ ...error, myLists: 'unexpectedError' });
      } finally {
        setIsLoading({ ...isLoading, myLists: false });
      }
    };

    getMyLists();
  }, []);

  useEffect(() => {
    const getMyListById = async () => {
      if (!myListIdToView) return;

      setIsLoading({ ...isLoading, products: true });

      try {
        const response = await MyListService.getMyListById(myListIdToView, accessToken);
        if (response.status) {
          setMyListProductsToView(response.data.items);
        } else {
          setError({ ...error, products: 'client_error' });
        }
      } catch (err) {
        setError({ ...error, products: 'unexpectedError' });
      } finally {
        setIsLoading({ ...isLoading, products: false });
      }
    };

    getMyListById();
  }, [myListIdToView]);

  const handleViewMyList = (myListId: number) => {
    setMyListIdToView(myListId);
  };

  const handleClickCreateNewMyList = () => {
    setIsCreateUpdateMyListModalOpen(true);
  };

  const handleCloseCreateNewMyList = () => {
    setIsCreateUpdateMyListModalOpen(false);
  };

  const handleClickUpdateMyList = (myListId: number, myListName: string) => {
    setMyListToEdit({ id: myListId, name: myListName });
    setIsCreateUpdateMyListModalOpen(true);
  };

  const handleDeleteMyList = async (myListId: number) => {
    await MyListService.deleteMyList(myListId, accessToken);

    // TODO: fix DELETE response structure
    setMyLists((prev) => prev.filter(({ id }) => id !== myListId));

    if (myListIdToView === myListId) {
      setMyListIdToView(null);
      setMyListProductsToView([]);
    }
  };

  const alreadyUsedMyListNames = myLists.map(({ name }) => name);

  const handleCreateUpdateMyList = async (name: string, myListToEdit?: EditMyList) => {
    if (alreadyUsedMyListNames.includes(name)) {
      setError((prev) => ({ ...prev, createUpdateMyList: 'myListNameAlreadyUsed' }));
      return;
    }

    setIsLoading((prev) => ({ ...prev, createUpdateMyList: true }));

    try {
      let response;
      if (myListToEdit) {
        response = await MyListService.updateMyList(myListToEdit.id, name, accessToken);
      } else {
        response = await MyListService.createMyList(name, accessToken);
      }

      if (response.status) {
        setIsCreateUpdateMyListModalOpen(false);

        if (myListToEdit) {
          setMyLists((prev) =>
            prev.map((myList) => {
              if (myList.id === myListToEdit.id) {
                return { ...myList, name: name };
              }
              return myList;
            })
          );
        } else {
          setMyLists((prev) => [response.data, ...prev]);
        }
      } else {
        setError((prev) => ({
          ...prev,
          createUpdateMyList: response.errors_type as CreateUpdateMyListError,
        }));
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        createUpdateMyList: 'unexpectedError',
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, createUpdateMyList: false }));
    }
  };

  const handleRemoveProductFromMyList = async (myListId: number | null, productId: number) => {
    if (myListId === null) return;
    await MyListService.removeProductFromMyList(myListId, productId, accessToken);

    if (myListIdToView === myListId) {
      setMyListProductsToView((prev) => prev.filter((item) => item.product_id !== productId));
    }
  };

  const myListsLength = myLists.length;
  const shouldMyListsHaveOverflowScroll = myListsLength > 6;

  const isThereSelectedMyList = myListIdToView !== null;
  const selectedMyListItemsLength = isThereSelectedMyList ? myListProductsToView.length : 0;
  const shouldSelectedMyListItemsHaveOverflowScroll = selectedMyListItemsLength > 6;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex h-[20%] w-[30%] items-center justify-start px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{MYLISTS_TEXT['hero']['h1']}</h2>
        </div>
        <div className="ml-5">
          <button
            onClick={handleClickCreateNewMyList}
            className="bg-primary hover:text-accent w-30 cursor-pointer rounded-2xl text-center align-middle text-sm font-bold text-gray-800"
          >
            {MYLISTS_TEXT['hero']['addNewMyListButton']}
          </button>
        </div>
      </div>

      {/* Modal */}
      {isCreateUpdateMyListModalOpen && (
        <CreateUpdateMyListModal
          handleCloseCreateUpdateMyListModal={handleCloseCreateNewMyList}
          handleCreateUpdateMyList={handleCreateUpdateMyList}
          mode={myListToEdit ? 'update' : 'create'}
          isLoading={isLoading['createUpdateMyList']}
          error={error['createUpdateMyList']}
          myListToUpdate={myListToEdit || undefined}
        />
      )}

      <div className="flex min-h-[400px] gap-4">
        {/* Left, My Lists */}
        <ul
          className={`h-[70%] w-[30%] rounded bg-white shadow-sm ${
            shouldMyListsHaveOverflowScroll ? 'overflow-y-scroll' : ''
          }`}
        >
          {!isLoading['myLists'] &&
            !error['myLists'] &&
            myListsLength > 0 &&
            myLists.map((myList, i) => (
              <MyList
                key={myList.id}
                arrayIndex={i}
                isMyListCurrentlyViewed={myListIdToView ? myListIdToView === myList.id : false}
                handleMyListToView={handleViewMyList}
                handleDeleteMyList={handleDeleteMyList}
                handleClickMyListToEdit={handleClickUpdateMyList}
                {...myList}
              />
            ))}
          {!isLoading['myLists'] && !error['myLists'] && myListsLength === 0 && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists']['noMyLists']}</li>
          )}

          {isLoading['myLists'] && !error['myLists'] && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists']['loading']}</li>
          )}

          {!isLoading['myLists'] && error['myLists'] && (
            <li className="p-4 text-gray-500">{MYLISTS_TEXT['myLists'][error['myLists']]}</li>
          )}
        </ul>

        {/* Right, Products */}
        <ul
          className={`h-[70%] w-[70%] rounded bg-white shadow-sm ${
            shouldSelectedMyListItemsHaveOverflowScroll ? 'overflow-y-scroll' : ''
          }`}
        >
          {myListIdToView &&
            !isLoading['products'] &&
            !error['products'] &&
            selectedMyListItemsLength === 0 && (
              <li className="p-4 text-gray-500">{MYLISTS_TEXT['products']['noProducts']}</li>
            )}

          {isThereSelectedMyList &&
            selectedMyListItemsLength > 0 &&
            myListProductsToView.map((item, i) => (
              <MyListItem
                key={item.id}
                arrayIndex={i}
                handleDeleteProductMyList={() =>
                  handleRemoveProductFromMyList(myListIdToView, item.product_id)
                }
                {...item}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}
