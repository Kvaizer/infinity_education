import React, {useCallback, useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector, useDebounce} from '../../utils/hooks';
import {addNewCard, getCards, removeCard, updateCard} from '../../reducers/cardsReducer';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import {Navigate, useNavigate} from 'react-router-dom';
import s from './Cards.module.css'
import {AppPagination} from '../../common/Pagination/Pagination';
import {SortType} from '../../api/packsAPI';
import Preloader from '../../common/Preloader/Preloader';
import {UniversalSearch} from '../../common/UniversalSearch/UniversalSearch';
import AppModal from '../AppModal/AppModal';
import {TextField} from '@mui/material';
import {updatePack} from '../../reducers/packListsReducer';


export const Cards = React.memo(() => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const isLoggedIn = useAppSelector(state => state.app.isLoggedIn)
    const showPackId = useAppSelector(state => state.packsList.showPackId)
    const editPackId = useAppSelector(state => state.packsList.editPackId)
    const cardsTotalCount = useAppSelector(state => state.cards.cardsTotalCount)
    const appStatus = useAppSelector(state => state.app.appStatus)
    const cards = useAppSelector(state => state.cards.cards)
    const currentPackName = useAppSelector(state => {
        if (showPackId || editPackId) {
            const pack = state.packsList.packs.find((item) => item._id === (showPackId || editPackId))
            if (pack) return pack.name
        } else return ''
    })

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [sort, setSort] = useState<SortType>('0updated')
    const [searchTerm, setSearchTerm] = useState('');
    const [newPackName, setNewPackName] = useState('')

    const debouncedSearchTerm = useDebounce(searchTerm, 1000);

    const currentPackId = showPackId || editPackId

    useEffect(() => {
        if (searchTerm) {
            dispatch(getCards({
                cardsPack_id: currentPackId,
                page: page + 1,
                pageCount: rowsPerPage,
                cardQuestion: debouncedSearchTerm,
                sortCards: sort
            }))
        } else {
            dispatch(getCards({
                cardsPack_id: currentPackId,
                page: page + 1,
                pageCount: rowsPerPage,
                sortCards: sort
            }))
        }
    }, [dispatch, page, currentPackId, rowsPerPage, debouncedSearchTerm, sort])

    const createNewCardHandler = useCallback((cardsPack_id: string, question: string, answer: string) => {
        dispatch(addNewCard(cardsPack_id, question, answer))
    }, [dispatch])

    const deleteCardsHandler = useCallback((id: string) => {
        dispatch(removeCard(id))
    }, [dispatch])

    const updateCardsHandler = useCallback((id: string, question: string) => {
        dispatch(updateCard(id, question))
    }, [dispatch])

    const updatePackNameHandler = useCallback((newPackName: string) => {
        dispatch(updatePack(editPackId, newPackName))
    }, [dispatch, newPackName, editPackId])

    const backHandler = useCallback(() => {
        navigate('/mainPage')
    }, [navigate])

    const sortHandler = useCallback(() => {
        if (sort === '1updated') setSort('0updated')
        else setSort('1updated')
    }, [dispatch, sort])

    if (!isLoggedIn) {
        return <Navigate to="/login"/>
    }

    return (
        <div className={s.mainContainer}>
            {appStatus === 'succeeded' ?
                <Paper className={s.container} style={{padding: '15px'}}>
                    <Button
                        className={s.btnsBack}
                        style={{borderRadius: '15px', marginLeft: '10px'}}
                        onClick={backHandler}
                        size={'small'}
                        variant={'contained'}
                        color={'primary'}
                        sx={{mt: 3, mb: 2}}>
                        Back
                    </Button>
                    <AppModal title={'EditPack'} children={[
                        <Button
                            key={'1'}
                            onClick={() => updatePackNameHandler(newPackName)}
                            style={{margin: '5px'}}
                            sx={{mt: 3, mb: 2}}
                            className={s.btnsEdit}
                            variant={'contained'}>
                            Save
                        </Button>,
                        <TextField
                            key={'2'}
                            color={"secondary"}
                            margin="normal"
                            id="email"
                            label="New pack name"
                            autoFocus
                            helperText="Enter new pack name"
                            value={newPackName}
                            onChange={(e) => setNewPackName(e.currentTarget.value)}
                        />
                    ]}/>
                    <div>{currentPackName}</div>
                    <div className={s.search}>
                        <UniversalSearch setSearchTerm={setSearchTerm} searchTerm={searchTerm}/>
                    </div>
                    <div>
                        {editPackId && <Button
                            style={{borderRadius: '15px', marginLeft: '10px'}}
                            className={s.btnsAdd}
                            size={'small'}
                            sx={{mt: 3, mb: 2}}
                            onClick={() => createNewCardHandler(currentPackId, 'Xander Card', 'Xander answer')}
                            variant={'contained'}>
                            Add Cards
                        </Button>}
                    </div>
                    {cards.length === 0 ? <div style={{textAlign: 'center', fontSize: '32px', fontWeight: 'bolder'}}>There are no questions</div> : <TableContainer component={Paper} className={s.container}>
                        <Table aria-label="custom pagination table">
                            <TableBody>
                                <TableRow style={{textAlign: 'left', backgroundColor: 'rgb(184 245 213 / 54%)'}}>
                                    <TableCell align="left">Question</TableCell>
                                    <TableCell align="center">Answer</TableCell>
                                    <TableCell align="right" className={s.cursor} onClick={sortHandler}>Last
                                        Updated</TableCell>
                                    <TableCell align="right">Grade</TableCell>
                                    {editPackId ? <TableCell align="right">Action</TableCell> : null}
                                </TableRow>
                                {cards.map((card) => {
                                    return <TableRow key={card._id}>
                                        <TableCell component="th" scope="row">
                                            {card.question}
                                        </TableCell>
                                        <TableCell style={{width: 150}} align="right">
                                            {card.answer}
                                        </TableCell>
                                        <TableCell style={{width: 150}} align="right">
                                            {card.updated.split('T')[0].replace(/-/gi, '.')}
                                        </TableCell>
                                        <TableCell style={{width: 150}} align="right">
                                            <Rating
                                                name="simple-controlled"
                                                value={3}
                                                readOnly
                                                precision={0.5}
                                                emptyIcon={<StarIcon style={{opacity: 0.55}} fontSize="inherit"/>}
                                            />
                                        </TableCell>
                                        {editPackId && <TableCell style={{width: 150}} align="right">
                                            <Button
                                                style={{margin: '5px'}}
                                                className={s.btnsDelete}
                                                size={'small'}
                                                variant={'contained'}
                                                color={'error'}
                                                sx={{mt: 3, mb: 2}}
                                                onClick={() => deleteCardsHandler(card._id)}>
                                                Delete
                                            </Button>
                                            <Button
                                                style={{margin: '5px'}}
                                                className={s.btnsEdit}
                                                color={'secondary'}
                                                size={'small'}
                                                sx={{mt: 3, mb: 2}}
                                                onClick={() => updateCardsHandler(card._id, 'Update question')}
                                                variant={'contained'}>
                                                Edit
                                            </Button>
                                        </TableCell>}
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                        <AppPagination
                            setPage={setPage}
                            page={page}
                            totalAmountOfItems={cardsTotalCount}
                            setRowsPerPage={setRowsPerPage}
                            rowsPerPage={rowsPerPage}/>
                    </TableContainer>}
                </Paper>
                : <Preloader/>}
        </div>
    );
});
