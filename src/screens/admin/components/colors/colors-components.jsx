import React, { useEffect, useState } from 'react'
import {
    Card, Button, Table, Form, InputGroup
} from 'react-bootstrap'
import { FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createColor, deleteColor, getColors } from '../../../../services/color/color-services'

export const ColorsComponentTab = () => {
    const [colors, setColors] = useState([]);
    const [colorInput, setColorInput] = useState('');
    const [flag, setFlag] = useState(false);

    const handleAddColor = async () => {
        if (!colorInput.trim()) {
            toast.error('Color name cannot be empty');
            return;
        };

        try {
            const response = await createColor({ color: colorInput.trim() });
            if (response.status === 200) {
                setFlag(!flag);
                setColorInput('');
                toast.success('Color added successfully');
            } else {
                toast.error('Failed to add color');
            }
        } catch (error) {
            toast.error('An error occurred while adding color: ', error);
        }
    };

    const handleDeleteColor = async (id) => {
        try {
            const response = await deleteColor(id);
            if (response.status === 200) {
                setFlag(!flag);
                toast.success('Color deleted successfully');
            } else {
                toast.error('Failed to delete color');
            }
        } catch (error) {
            toast.error('An error occurred while deleting color: ', error);
        }
    };

    useEffect(() => {
        const loadColors = async () => {
            try {
                const response = await getColors();
                if (response.status === 200) {
                    setColors(response.data || []);
                }
            } catch (error) {
                toast.error('Failed to load colors: ', error);
            }
        };

        loadColors();
    }, [flag]);


    return (
        <React.Fragment>
            <Card className="shadow-sm border">
                <Card.Body>
                    <h5 className="mb-3">Colors</h5>

                    <InputGroup className="mb-3" style={{ maxWidth: 450 }}>
                        <Form.Control
                            placeholder="Color name"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value.toUpperCase())}
                        />
                        <Button
                            variant="success"
                            onClick={() => handleAddColor()}
                        >
                            Add
                        </Button>
                    </InputGroup>

                    <Table hover>
                        <tbody>
                            {colors.length === 0 ? (
                                <tr>
                                    <td className="text-muted text-center py-3">
                                        No colors yet
                                    </td>
                                </tr>
                            ) : (
                                colors.map((data, i) => (
                                    <tr key={i}>
                                        <td>{data.color_name}</td>
                                        <td>
                                            <span
                                                style={{
                                                    background: data.color_name.toLowerCase(),
                                                    color: '#fff',
                                                    padding: '4px 50px',
                                                    borderRadius: 6,
                                                }}
                                            >
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDeleteColor(data.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>
        </React.Fragment>
    )
}
