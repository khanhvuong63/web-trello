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
import { capitalizeFirstLetter } from '~/utils/formatters'

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
function BoardBar({ board }) {
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
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLES}
            icon={<DashboardIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={ capitalizeFirstLetter(board?.type) }
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
              '&:hover': { borderColor:'white' }
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
            <Avatar alt="Khanhdev" src='https://lh3.googleusercontent.com/a/ACg8ocLgOiaLDKSCa_C9JXOewfKdrOTdQGJdLKm8s5-VoPAfbA=s389-c-no' />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src='https://yt3.ggpht.com/yti/AGOGRCq9__kkv3OAaPHq-xIgqqdGG_rzf3RkvcCOGTkfoA=s108-c-k-c0x00ffffff-no-rj' />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src='https://scontent.fvca1-1.fna.fbcdn.net/v/t39.30808-6/356204706_2556975427793295_4078149828310438755_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=MOL5yO-yD4wAX_56pX0&_nc_ht=scontent.fvca1-1.fna&oh=00_AfBVjauQuL0em4jQx3K0i_s1jwD-qd1LmZwiCAp7WViBWA&oe=65DDA989' />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src='/static/images/avatar/1.jpg' />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src='/static/images/avatar/1.jpg' />
          </Tooltip>
          <Tooltip title='Khanhdev'>
            <Avatar alt="Khanhdev" src='/static/images/avatar/1.jpg' />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
