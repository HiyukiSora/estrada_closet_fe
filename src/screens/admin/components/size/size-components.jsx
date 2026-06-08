import React, { useEffect, useState } from 'react'
import {
    Card, Button, Table, Badge, Form, InputGroup
} from 'react-bootstrap'
import { FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createSize, deleteSize, getSizes } from '../../../../services/size/size-services'

export const SizesComponentTab = () => {
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState('');
    const [flag, setFlag] = useState(false);

    const handleAddSize = async () => {
        if (!sizeInput.trim()) {
            toast.error('Size cannot be empty');
            return;
        };

        try {
            const response = await createSize({ size: sizeInput.trim() });
            if (response.status === 200) {
                setFlag(!flag);
                setSizeInput('');
                toast.success('Size added successfully');
            } else {
                toast.error('Failed to add size');
            }
        } catch (error) {
            toast.error('An error occurred while adding size: ', error);
        }
    };

    const handleDeleteSize = async (id) => {
        try {
            const response = await deleteSize(id);
            if (response.status === 200) {
                setFlag(!flag);
                toast.success('Size deleted successfully');
            } else {
                toast.error('Failed to delete size');
            }
        } catch (error) {
            toast.error('An error occurred while deleting size: ', error);
        }
    };

    useEffect(() => {
        const loadSizes = async () => {
            try {
                const response = await getSizes();
                if (response.status === 200) {
                    setSizes(response.data || []);
                }
            } catch (error) {
                toast.error('Failed to load sizes: ', error);
            }
        };

        loadSizes();
    }, [flag]);

    return (
        <React.Fragment>
            <Card className="shadow-sm border">
                <Card.Body>
                    <h5 className="mb-3">Sizes</h5>

                    <InputGroup className="mb-3" style={{ maxWidth: 300 }}>
                        <Form.Control
                            placeholder="Add size (e.g. M)"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
                        />
                        <Button
                            variant="dark"
                            onClick={() => handleAddSize()}
                        >
                            Add
                        </Button>
                    </InputGroup>

                    <Table hover>
                        <tbody>
                            {sizes.length === 0 ? (
                                <tr>
                                    <td className="text-muted text-center py-3">
                                        No sizes yet
                                    </td>
                                </tr>
                            ) : (
                                sizes.map((data, i) => (
                                    <tr key={i}>
                                        <td>
                                            <Badge bg="secondary">{data.size_name}</Badge>
                                        </td>
                                        <td className="text-end">
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => handleDeleteSize(data.id)}
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
