import {instance} from './instance';
import {Pack} from '../reducers/packListsReducer';

type PacksList = {
    cardPacks: Pack[]
    page: number
    pageCount: number
    cardPacksTotalCount: number
    minCardsCount: number
    maxCardsCount: number
    token: string
    tokenDeathTime: number
}

export type PostPackPayloadType = {
    name: string
    private: boolean
    deckCover?: string
}

export type SortType =
    | '0updated'
    | '1updated'
    | '0answer'
    | '1answer'
    | '0question'
    | '1question'
    | '0packName'
    | '1packName'
    | '0numberOfCards'
    | '1numberOfCards'
    | '0userName'
    | '1userName'

export type Params = {
    packName?: string
    min?: number
    max?: number
    sortPacks?: SortType
    page?: number
    pageCount?: number
    user_id?: string
}

export type PostNewPackResponseType = {
    newCardsPack: Pack
    token: string
    tokenDeathTime: number
}

export const packsAPI = {
    getPacks(params: Params = {}) {
        return instance.get<PacksList>('cards/pack', {
            params: {
                ...params
            }
        })
    },

    deletePack(id: string) {
        return instance.delete('cards/pack', {
            params: {id}
        })
    },

    createNewPack(payload: PostPackPayloadType) {
        return instance.post<PostNewPackResponseType>('cards/pack', {cardsPack: {...payload}})
    }
}