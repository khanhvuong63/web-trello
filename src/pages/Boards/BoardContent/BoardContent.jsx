import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'
import { DndContext, DragOverlay, closestCorners, defaultDropAnimationSideEffects, getFirstCollision, pointerWithin, useSensor, useSensors } from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

import { MouseSensor, TouchSensor } from '~/customLibraries/dndKitSensors'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN:'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD:'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board, createNewColumn, createNewCard, moveColumns }) {
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

  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // diem va cham cuoi cung ( xu li thuat toan phat hien va cham )
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const findColumnByCardId = (cardId) => {
    //lưu ý: nền dùng c.cards thay vì c.cardOrderIds bởi ở bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumnsState.find(column => column.cards.map(card => card._id)?.includes(cardId))
  }
  // function chung xử lý việc cập nhật tại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
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

        // Thêm placeholder Card nếu column bị rỗng
        if (isEmpty( nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //nextOverColumn: column mới
      if (nextOverColumn) {
        // kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id

        }
        // tiếp theo là thêm cái đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // xóa Placeholder Card đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      console.log('nextColumns', nextColumns)
      return nextColumns
    })
  }

  //Trigger khi bắt đầu kéo 1 phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // neu la kéo card thì mới thực hiện hành động set giá trị column
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard (findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo (drag) phần tử
  const handleDragOver = (event) => {
    // ko làm gì thêm nếu như đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

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
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  //Trigger khi kết thúc hành động kéo (drag) 1 phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)
    const { active, over } = event

    // cần đảm bảo nếu ko tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì ko làm gì
    if (!active || !over) return

    // xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //console.log('hanh dong keo tha card tam thoi ko lam gi ca')
      // activeDraggingCard: là các card đang dc kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData} } = active
      // overCard là cái Card đang tương tác trên hoặc dưới so với cái card dc kéo ở trên
      const { id: overCardId } = over

      // tìm 2 cái columns và cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // nếu ko tồn tại 1 trong 2 column thì ko làm gì hết tránh crash trang web
      if (!activeColumn || !overColumn) return

      // console.log('activeDragItemData ', activeDragItemData)
      //console.log('overColumn ', overColumn)
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // hanh dong keo tha card giua 2 column khac nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // hanh dong keo tha card trong cung mot cai column

        // lấy vị trí củ từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lấy vị trí mới từ overColumn
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        // dùng arrMove vì kéo card trong 1 cái column thi tương tự với logic kéo column trong 1 cái boardContent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumnsState( prevColumns => {
          // clone mảng OrderedColumnsState củ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)
          // cat nhat lai 2 gia tri column moi la card va cardOrderedIds trong cai targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)
          // tra ve gia tri state moi
          return nextColumns
        })
      }
    }

    // xử lý kéo thả column trong boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // nếu vị trí kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí củ từ active
        const oldColumnIndex = orderedColumnsState.findIndex(c => c._id === active.id)
        // lấy vị trí mới từ active
        const newColumnIndex = orderedColumnsState.findIndex(c => c._id === over.id)

        // dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu
        const dndOrderedColumns = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)
        // gọi lên props function moveColumns nằm component cha cao nhất ( boards/_id.jsx )
        moveColumns(dndOrderedColumns)

        // cập nhật lại state columns ban đầu sau khi đã kéo thả
        setOrderedColumnsState(dndOrderedColumns)
      }
    }
    // những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active:  { opacity:'0.5' } }
    })
  }
  // args = arguments = các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // truong hop keo column thi dung thuat toan closestCorners la chuan nhat
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // tìm các điểm giao nhau, va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    if (!pointerIntersections?.length) return
    // thuat toan phat hien va cham se tra ve mot mang cac va cham o day
    //const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(args)

    // tim overId dau tien trong intersections o tren
    let overId = getFirstCollision(pointerIntersections, 'id')

    if (overId) {
      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if (checkColumn) {
        //console.log('overId before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return ( container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id) )
          })
        }) [0]?.id
        //console.log('overId after: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // neu overId la null thi tra ve mang rong - trach bug cash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumnsState] )

  return (
    <DndContext
      sensors={mySensors}
      // thuật toán phát hiện va chạm (nếu ko có nó thì card với với cover lớn sẽ ko kéo qua Column dc vì lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng closestCorners thay vì closestCenter

      // tự custom nâng cao thuật toán phát hiện va chạm
      collisionDetection={collisionDetectionStrategy}
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
        <ListColumns
          columns={orderedColumnsState}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} /> }
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} /> }
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
