import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, defaultDropAnimationSideEffects, useSensor, useSensors } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep } from 'lodash'

const ACTIVE_DRAG_ITEM_STYLE = {
  COLUMN:'ACTIVE_DRAG_ITEM_STYLE_COLUMN',
  CARD:'ACTIVE_DRAG_ITEM_STYLE_CARD'
}

function BoardContent({ board }) {
  //https://docs.dndkit.com/api-documentation/sensors
  //nếu dùng pointerSensor mặc định thì css touch-action: none ở phần tử kéo thả nhưng còn bug
  //const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // yêu cầu trỏ chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // nhấn giữ 250ms và dung sai của cảm ứng 500px là kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm tốt trên mobile ko bị bug 
  const mySensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])
  // cùng 1 thời điểm chỉ có 1 phần tử đang dc kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)

  const [activeDragItemType, setActiveDragItemType] = useState(null)

  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const findColumnByCardId = (cardId) => {
    //lưu ý: nền dùng c.cards thay vì c.cardOrderIds bởi ở bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumnsState.find(column => column.cards.map(card => card._id)?.includes(cardId))
  }
  //Trigger khi bắt đầu kéo 1 phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_STYLE.CARD : ACTIVE_DRAG_ITEM_STYLE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }

  // Trigger trong quá trình kéo (drag) phần tử
  const handleDragOver = (event) => {
    // ko làm gì thêm nếu như đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) return

    // còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    //console.log('handleDragOver ', event)
    const { active, over } = event

    // cần đảm bảo nếu ko tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì ko làm gì
    if (!active || !over) return

    // activeDraggingCard: là các card đang dc kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData} } = active
    // overCard là cái Card đang tương tác trên hoặc dưới so với cái card dc kéo ở trên
    const { id: overCardId } = over

    // tìm 2 cái columns và cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // nếu ko tồn tại 1 trong 2 column thì ko làm gì hết tránh crash trang web
    if (!activeColumn || !overColumn) return

    // xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì ko làm gì
    // vì đây đang là hoàn toàn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handDragEnd)
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumnsState( prevColumns => {
        // tìm vị trí ( index ) của cái overCard trong column đích (nơi mà activeCard sắp dc thả)
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0

        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        // clone mảng OrderedColumnsState cũ ra 1 cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
        //nextActiveColumn: column củ
        if (nextActiveColumn) {
          // xóa card ở cái column active
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

          // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }
        //nextOverColumn: column mới
        if (nextOverColumn) {
          // kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

          // tiếp theo là thêm cái đang kéo vào overColumn theo vị trí index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)

          // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }

        return nextColumns
      })
    }
  }

  //Trigger khi kết thúc hành động kéo (drag) 1 phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)

    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD) {
      console.log('hanh dong keo tha card tam thoi ko lam gi ca')
      return
    }
    const { active, over } = event

    // cần đảm bảo nếu ko tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì ko làm gì
    if (!active || !over) return

    // nếu vị trí kéo thả khác với vị trí ban đầu
    if (active.id !== over.id) {
      // lấy vị trí củ từ active
      const oldIndex = orderedColumnsState.findIndex(c => c._id === active.id)
      // lấy vị trí mới từ active
      const newIndex = orderedColumnsState.findIndex(c => c._id === over.id)

      // dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu
      const dndOrderedColumns = arrayMove(orderedColumnsState, oldIndex, newIndex)
      // 2 cái console.log dữ liệu này sau dùng để xử lý gọi API
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns ', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds ', dndOrderedColumnsIds)

      // cập nhật lại state columns ban đầu sau khi đã kéo thả
      setOrderedColumnsState(dndOrderedColumns)
    }
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active:  { opacity:'0.5' } }
    })
  }
  return (
    <DndContext
      sensors={mySensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode ==='dark' ? '#34495e' : '#1976d2'),
        width:'100%',
        height: ( theme ) => theme.trello.boardContentHeight,
        p:'10px 0'
      }}>
        <ListColumns columns={orderedColumnsState} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) && <Column column={activeDragItemData} /> }
          {(activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD) && <Card card={activeDragItemData} /> }
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
