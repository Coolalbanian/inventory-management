'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Card, CardContent, CardActions, Grid } from '@mui/material';
import { firestore } from '@/app/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ddd',
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    await setDoc(docRef, { quantity: 1, description: '', price: 0, supplier: '' });
    await updateInventory();
    setItemName('');
    setOpenAdd(false);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setOpenEdit(true);
  };
  
  const handleCloseEdit = () => {
    setSelectedItem(null);
    setOpenEdit(false);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredInventory(filtered);
  };

  const handleSaveEdit = async () => {
    const docRef = doc(collection(firestore, 'inventory'), selectedItem.name);
    await setDoc(docRef, selectedItem);
    await updateInventory();
    handleCloseEdit();
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(inventory);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_data.csv';
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory Data', 20, 10);

    let y = 20;
    inventory.forEach(({ name, quantity, description, price = 0, supplier = '' }) => {
      doc.text(`Item: ${name}`, 20, y);
      doc.text(`Quantity: ${quantity}`, 20, y + 10);
      doc.text(`Description: ${description || 'N/A'}`, 20, y + 20);
      doc.text(`Price: $${price.toFixed(2)}`, 20, y + 30);
      doc.text(`Supplier: ${supplier || 'N/A'}`, 20, y + 40);
      y += 50;
    });

    doc.save('inventory_data.pdf');
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      p={2}
      bgcolor="#f5f5f5"
    >
      <Typography variant="h3" gutterBottom>
        Pantry Inventory
      </Typography>
      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ maxWidth: 600 }}
      />
      <Stack spacing={2} direction="row" mb={2}>
        <Button variant="contained" onClick={handleOpenAdd}>
          Add New Item
        </Button>
        <Button variant="contained" onClick={exportToCSV}>
          Export to CSV
        </Button>
        <Button variant="contained" onClick={exportToPDF}>
          Export to PDF
        </Button>
      </Stack>
      <Grid container spacing={3} justifyContent="center">
        {filteredInventory.map(({ name, quantity, description, price = 0, supplier = '' }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: {description || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ${price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supplier: {supplier || 'N/A'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenEdit({ name, quantity, description, price, supplier })}>Edit</Button>
                <Button size="small" onClick={() => removeItem(name)}>Remove</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Item Modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-add-title"
        aria-describedby="modal-add-description"
      >
        <Box sx={style}>
          <Typography id="modal-add-title" variant="h6" component="h2">
            Add New Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleCloseAdd();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Item Modal */}
      {selectedItem && (
        <Modal
          open={openEdit}
          onClose={handleCloseEdit}
          aria-labelledby="modal-edit-title"
          aria-describedby="modal-edit-description"
        >
          <Box sx={style}>
            <Typography id="modal-edit-title" variant="h6" component="h2">
              Edit Item
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={selectedItem.name}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                type="number"
                fullWidth
                value={selectedItem.quantity}
                onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value, 10) })}
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                value={selectedItem.description}
                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
              />
              <TextField
                label="Price"
                variant="outlined"
                type="number"
                fullWidth
                value={selectedItem.price}
                onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) })}
              />
              <TextField
                label="Supplier"
                variant="outlined"
                fullWidth
                value={selectedItem.supplier}
                onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
              />
              <Button
                variant="contained"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}
    </Box>
  );
}

