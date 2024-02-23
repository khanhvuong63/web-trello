export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

// placeholder Card sẽ dc ẩn ở giao dien UI user
// cấu trúc Id của card này để unique đơn giản: columnId-placeholder-card (mỗi column tối đa 1 placeholder card)'
// khi tạo phải đầy đủ (_id, boardId, columnId, FE_Placeholdercard)
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}
