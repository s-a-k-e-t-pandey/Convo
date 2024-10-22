import { atom } from "recoil"

export const messageState = atom({
    key: "messageState",
    default: [],
})

export const messageLoadingState = atom({
    key: "messageLoadingState",
    default: true
})

export const roomMessageSelector = selector({
    key: 'roomMessageSelector',
    get: async ({get})=>{
        const roomId = get(currentRoomState)
    }
})