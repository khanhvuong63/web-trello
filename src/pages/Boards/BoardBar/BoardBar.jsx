import { Box, Tooltip } from '@mui/material'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import theme from '~/theme'


const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root':{
    color:'white'
  },
  '&:hover':{
    bgcolor: 'primary.50'
  }
}
function BoardBar() {
  return (
    <Box sx={{
      width:'100%',
      height:(theme) => theme.trello.boardBarHeight,
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      gap: 2,
      paddingX: 2,
      overflowX:'auto',
      bgcolor: (theme) => (theme.palette.mode ==='dark' ? '#34495e' : '#1976d2'),
      borderTop: '1px solid white'
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label="KhanhDev"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon/>}
          sx=
            {{
              color:'white',
              borderColor:'white',
              '&:hover': {borderColor:'white'}
            }}
        >
          Invite
        </Button>
        <AvatarGroup
          sx={{
            '& .MuiAvatar-root':{
              width:30,
              height:30,
              fontSize:16,
              border:'none',
              color:'white',
              cursor:'pointer',
              '&:first-of-type':{ bgcolor:'#a4b0be' }
            }
          }}
          max={4}
        >
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src="/static/images/avatar/1.jpg" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
