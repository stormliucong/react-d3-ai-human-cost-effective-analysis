import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { nodeColors } from './appConfig';


const NodeListItem = ({ label, color, letter }) => (
    <ListItem style={{ padding: '10', display: 'flex', alignItems: 'center' }}>
      <ListItemAvatar>
        <Avatar style={{ backgroundColor: color, border: '0px solid black' }}>
          {letter}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={label} />
    </ListItem>
  );

const FigureLegend = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <List>
        <NodeListItem label="Start Node" color={nodeColors.START} letter="S" />
        <NodeListItem label="Decision Node" color={nodeColors.DECISION} letter="D" />
        <NodeListItem label="Action Node" color={nodeColors.ACTION} letter="A" />
        <NodeListItem label="Outcome Node" color={nodeColors.OUTCOME} letter="O" />
        <NodeListItem label="Exit Node" color={nodeColors.EXIT} letter="E" />
      </List>
    </Box>
    );
}
export default FigureLegend;

        
        