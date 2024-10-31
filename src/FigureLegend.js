import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { nodeColors } from './appConfig';


const NodeListItem = ({ label, color, letter }) => (
    <ListItem style={{ padding: '0', display: 'flex', alignItems: 'center' }}>
      <ListItemAvatar>
        <Avatar style={{ backgroundColor: color, border: '2px solid black' }}>
          {letter}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={label} />
    </ListItem>
  );

const FigureLegend = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>

        <List sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <NodeListItem label="Start" color={nodeColors.START} letter="S" />
        <NodeListItem label="Decision" color={nodeColors.DECISION} letter="D" /> 
        <NodeListItem label="Action" color={nodeColors.ACTION} letter="A" />
        <NodeListItem label="Outcome" color={nodeColors.OUTCOME} letter="O" />
        <NodeListItem label="Exit" color={nodeColors.EXIT} letter="E" />
      </List>
    </Box>
    );
}
export default FigureLegend;

        
        