import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

// boards
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  //luu y: axios se tra ve ket qua ve qua property cua no la data
  return response.data
}
export const UpdateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  //luu y: axios se tra ve ket qua ve qua property cua no la data
  return response.data
}
export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

// Columns
export const createNewColumnAPI = async(newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const UpdateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  //luu y: axios se tra ve ket qua ve qua property cua no la data
  return response.data
}

// Cards
export const createNewCardAPI = async(newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}