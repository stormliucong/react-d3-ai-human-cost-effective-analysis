import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  START: 'start', // start is a special decision node can not be deleted.
  DECISION: 'decision', // decision node can have parent of one outcome or null, and children of one or more actions.
  ACTION: 'action', // action node can have parent of one decision, and children of one or more outcomes.
  OUTCOME: 'outcome', // outcome node can have parent of one action, and children of one decision.
  EXIT: 'exit', // exit is a special outcome node can not have children.
};

const initialTreeData = {
  id: uuidv4(), // Unique identifier for the node
  name: 'Start',
  nodeType: nodeTypes.START,
  probability: 1,
  cost: 0,
  children: [
    {
      id: uuidv4(),
      name: 'Action 1',
      nodeType: nodeTypes.ACTION,
      probability: 0.5,
      cost: 0,
      children: []
    },
    {
      id: uuidv4(),
      name: 'Action 2',
      nodeType: nodeTypes.ACTION,
      probability: 0.5,
      cost: 100,
      children: []
    }
  ],
};

const TreeVisualization = () => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [newNode, setNewNode] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
    }
  }, [treeContainerRef.current]);

  const addNode = () => {
    const updatedTree = { ...treeData };
    console.log('updatedTree:', updatedTree); 
    const { ...nodeDetails } = newNode;
    nodeDetails.name = nodeDetails.name || 'New Node';
    nodeDetails.cost = nodeDetails.cost || 0;
    nodeDetails.probability = nodeDetails.probability || 0;
    nodeDetails.id = uuidv4();
    nodeDetails.children = []
    console.log('Add nodeDetails:', nodeDetails);
    console.log('selectedNode:', selectedNode);
    
    // insert node into the selectedNode in the tree
    const addNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.children.push(nodeDetails);
      } else if (node.children) {
        node.children.forEach(addNodeRecursive);
      }
    };

    addNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const deleteNode = () => {
    // Can't delete start node
    if (selectedNode.nodeType === nodeTypes.START) {
      alert('Cannot delete start node');
      return;
    }
    const updatedTree = { ...treeData };
    
    const deleteNodeRecursive = (node) => {
      if (node.children) {
        node.children = node.children.filter((child) => child.id !== selectedNode.id);
        node.children.forEach(deleteNodeRecursive);
      }
    };
   
    deleteNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node.data);

    const nodeType = node.data.nodeType;
    console.log('selected nodeType:', nodeType);
    let newNodeType = null;

    if (nodeType === nodeTypes.DECISION || nodeType === nodeTypes.START) {
      newNodeType = nodeTypes.ACTION;
    } else if (nodeType === nodeTypes.ACTION) {
      newNodeType = nodeTypes.OUTCOME;
    } else if (nodeType === nodeTypes.OUTCOME  ) {
      newNodeType = nodeTypes.DECISION;
    }

    if (newNodeType) {
      setNewNode({ ...newNode, nodeType: newNodeType});
      console.log('newNode:', newNode);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewNode((prevNode) => ({ ...prevNode, [name]: value }));
  };

  return (
    <div className="container">
      <div className="modal-panel">
        <h2>Edit Graph by Select a Node</h2>
        {selectedNode && (
          <>
          <h3>Selected node</h3>
          <pre>{JSON.stringify(selectedNode, null)}</pre>
          <div>
            <p>Node Type: {selectedNode.nodeType}</p>
            <p>Name: {selectedNode.name}</p>
            <p>Cost: {selectedNode.cost}</p>
            <p>Probability: {selectedNode.probability}</p>
          </div>
        
        <h3>Create a new node</h3>
        {newNode.nodeType === nodeTypes.DECISION && (
          <>
            <label>
              Decision Point:
              <input type="text" name="name" onChange={handleChange} />
            </label>
          </>
        )}
        {newNode.nodeType === nodeTypes.ACTION && (
          <>
            <label>
              Action Name:
              <input type="text" name="name" onChange={handleChange} />
            </label>
            <label>
              Cost:
              <input type="number" name="cost" onChange={handleChange} />
            </label>
            <label>
              Probability:
              <input type="number" name="probability" onChange={handleChange} />
            </label>
          </>
        )}
        {newNode.nodeType === nodeTypes.OUTCOME && (
          <>
            <label>
              Outcome:
              <input type="text" name="name" onChange={handleChange} />
            </label>
            <label>
              Cost:
              <input type="number" name="cost" onChange={handleChange} />
            </label>
            <label>
              Probability:
              <input type="number" name="probability" onChange={handleChange} />
            </label>
          </>
        )}
        <button onClick={addNode}>Add Node</button>
        <button onClick={deleteNode}>Delete Selected Node</button>
        
          </>
          )
        }
        <h2>Tree Details</h2>
        <pre>{JSON.stringify(treeData, null, 2)}</pre>
      </div>
      <div className="tree-panel" ref={treeContainerRef}>
        <Tree data={treeData} collapsible={false} translate={translate} onNodeClick={handleNodeClick} />
      </div>
      
    </div>
  );
};

export default TreeVisualization;
