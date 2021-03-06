import React from 'react';
import { arrayOf, func, shape } from 'prop-types';
import { withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { facilityListPropType } from '../util/propTypes';
import { makeFacilityListItemsDetailLink } from '../util/util';

function FacilityListsTable({
    facilityLists,
    history: {
        push,
    },
}) {
    return (
        <Paper style={{ width: '100%' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Name
                        </TableCell>
                        <TableCell>
                            Description
                        </TableCell>
                        <TableCell>
                            File Name
                        </TableCell>
                        <TableCell>
                            Active
                        </TableCell>
                        <TableCell>
                            Public
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        facilityLists
                            .map(list => (
                                <TableRow
                                    key={list.id}
                                    hover
                                    onClick={() => push(makeFacilityListItemsDetailLink(list.id))}
                                >
                                    <TableCell>
                                        {list.name}
                                    </TableCell>
                                    <TableCell>
                                        {list.description}
                                    </TableCell>
                                    <TableCell>
                                        {list.file_name}
                                    </TableCell>
                                    <TableCell>
                                        {list.is_active ? 'True' : 'False'}
                                    </TableCell>
                                    <TableCell>
                                        {list.is_public ? 'True' : 'False'}
                                    </TableCell>
                                </TableRow>))
                    }
                </TableBody>
            </Table>
        </Paper>
    );
}

FacilityListsTable.propTypes = {
    facilityLists: arrayOf(facilityListPropType).isRequired,
    history: shape({
        push: func.isRequired,
    }).isRequired,
};

export default withRouter(FacilityListsTable);
