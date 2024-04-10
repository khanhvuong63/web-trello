import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI,
  createNewCardAPI,
  createNewColumnAPI,
  UpdateBoardDetailsAPI,
  UpdateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sort'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    const boardId ='65f2a1434870d360300cd599'
    // call api
    fetchBoardDetailsAPI(boardId).then( (board) => {
      // cmt 71.1
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach (column => {
        // khi trang f5 cần xử lý vấn đề kéo thả vào 1 column rỗng video 37.2
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // cmt 71.2
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      //console.log('full board ', board)
      setBoard(board)
    } )
  }, [])

  // function này có nv gọi API tạo mới column và làm lại dữ liệu State Board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })
    // khi tao moi column thi chua co card, can xu ly van de keo tha vao 1 column rong
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    // cập nhật state board
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }
  // function này có nv gọi API tạo mới Card và làm lại dữ liệu State Board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    //console.log('createdCard ', createdCard)

    // cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
  }

  // function này co nv gọi API và xử lý khi kéo thả Column
  // Chỉ cần gọi API để cập nhật mảng ColumnOrderIds của Board chứa nó ( thay đổi vị trí trong board)
  const moveColumns = (dndOrderedColumns) => {
  //update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    // gọi API update Board
    UpdateBoardDetailsAPI(newBoard._id, { columnOrderIds:newBoard.columnOrderIds })
  }

  // khi di chuyển card trong cùng column
  // Chỉ cần gọi API để cập nhật mảng ColumnOrderIds của Column chứa nó ( thay đổi vị trí trong mảng)
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    //update cho chuẩn dữ liệu state Board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    //console.log('full board', board)
    setBoard(newBoard)
    // gọi API update Column
    UpdateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }
  // cmt 72.1 di chuyển card sang column khác...
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    //update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    // gọi API xử lý phía BE
    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds: dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }
  if (!board) {
    return (
      <Box sx={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap: 2,
        width: '100vw',
        height:'100vh'
      }}>
        <CircularProgress />
        <Typography> Loading Board... </Typography>
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height:'100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn = {createNewColumn}
        createNewCard = {createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}
// mockData?.board
export default Board
