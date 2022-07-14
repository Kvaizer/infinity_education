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
import TableSortLabel from '@mui/material/TableSortLabel';
import AppModal from '../AppModal/AppModal';
import TextField from '@mui/material/TextField';


export const Cards = React.memo(() => {
    console.log('render')
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const isLoggedIn = useAppSelector(state => state.app.isLoggedIn)
    const showPackId = useAppSelector(state => state.packsList.showPackId)
    const editPackId = useAppSelector(state => state.packsList.editPackId)
    const cardsTotalCount = useAppSelector(state => state.cards.cardsTotalCount)
    const appStatus = useAppSelector(state => state.app.appStatus)
    const cards = useAppSelector(state => state.cards.cards)

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [sort, setSort] = useState<SortType>('0updated')
    const [searchTerm, setSearchTerm] = useState('');

    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);

    useEffect(() => {
        if (questions.length === 0) {
            const q: string[] = []
            const cardsCopy = [...cards]
            cardsCopy.forEach(card => q.push(card.question))
            console.log(q)
            setQuestions(q)
        }
        if (answers.length === 0) {
            const a: string[] = []
            const cardsCopy = [...cards]
            cardsCopy.forEach(card => a.push(card.answer))
            setAnswers(a)
        }
    }, [cards])

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

    const updateCardsHandler = useCallback((id: string, question: string, answer: string) => {
        dispatch(updateCard(id, question, answer))
    }, [dispatch])

    const backHandler = () => {
        navigate('/mainPage')
    }

    const sortHandler = useCallback(() => {
        if (sort === '1updated') setSort('0updated')
        else setSort('1updated')
    }, [dispatch, sort])

    const sortAnswerHandler = useCallback(() => {
        if (sort === '1answer') setSort('0answer')
        else setSort('1answer')
    }, [dispatch, sort])

    const sortQuestionHandler = useCallback(() => {
        if (sort === '1question') setSort('0question')
        else setSort('1question')
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
                    <div className={s.search}>
                        <UniversalSearch setSearchTerm={setSearchTerm} searchTerm={searchTerm}/>
                    </div>
                    <div>
                        {editPackId &&
                            <AppModal description={'Add New Card'} title={'Add new card'} children={[
                                <TextField
                                    className={s.input}
                                    key={'2'}
                                    color={'secondary'}
                                    margin="normal"
                                    id="question"
                                    label="New question name"
                                    autoFocus
                                    helperText="Enter new question name"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.currentTarget.value)}
                                />,
                                <TextField
                                    className={s.input}
                                    key={'2'}
                                    color={'secondary'}
                                    margin="normal"
                                    id="answer"
                                    label="New answer value"
                                    helperText="Enter new answer name"
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.currentTarget.value)}
                                />,
                                <Button
                                    key={'5'}
                                    style={{borderRadius: '30px'}}
                                    className={s.btnsAdd}
                                    sx={{mt: 3, mb: 2}}
                                    onClick={() => createNewCardHandler(currentPackId, newQuestion, newAnswer)}
                                    variant={'contained'}>
                                    Add New Card
                                </Button>
                            ]}/>
                        }
                    </div>
                    {cards.length === 0 ?
                        <div style={{textAlign: 'center', fontSize: '32px', fontWeight: 'bolder'}}>There are no
                            questions</div> : <TableContainer component={Paper} className={s.container}>
                            <Table aria-label="custom pagination table">
                                <TableBody>
                                    <TableRow style={{textAlign: 'left', backgroundColor: 'rgb(184 245 213 / 54%)'}}>
                                        <TableCell align="left">
                                            <TableSortLabel
                                                onClick={sortQuestionHandler}
                                                active={true}
                                                direction={sort === '1question' ? 'asc' : 'desc'}>
                                            </TableSortLabel>
                                            Question
                                        </TableCell>
                                        <TableCell align="center">
                                            <TableSortLabel
                                                onClick={sortAnswerHandler}
                                                active={true}
                                                direction={sort === '1answer' ? 'asc' : 'desc'}>
                                            </TableSortLabel>
                                            Answer
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel
                                                onClick={sortHandler}
                                                active={true}
                                                direction={sort === '1updated' ? 'desc' : 'asc'}>
                                            </TableSortLabel>
                                            Last Updated
                                        </TableCell>
                                        <TableCell align="right">Grade</TableCell>
                                        {editPackId && <TableCell align="right">Action</TableCell>}
                                    </TableRow>
                                    {cards.map((card, index) => {
                                        return <TableRow key={card._id}>
                                            <TableCell component="th" scope="row">
                                                {card.question}
                                            </TableCell>
                                            <TableCell style={{width: 150}} align="center">
                                                {card.answer}
                                            </TableCell>
                                            <TableCell style={{width: 150}} align="right">
                                                {card.updated.split('T')[0].replace(/-/gi, '.')}
                                            </TableCell>
                                            <TableCell style={{width: 150}} align="right">
                                                <Rating
                                                    name="simple-controlled"
                                                    value={card.grade}
                                                    readOnly
                                                    precision={0.5}
                                                    emptyIcon={<StarIcon style={{opacity: 0.55}} fontSize="inherit"/>}
                                                />
                                            </TableCell>
                                            {editPackId && <TableCell style={{width: 150}} align="right">
                                                <AppModal title={'delete'}
                                                          description={'Do yo really want to remove this pack?'}
                                                          children={
                                                              <Button
                                                                  key={'1'}
                                                                  style={{borderRadius: '30px'}}
                                                                  className={s.btnsDelete}
                                                                  onClick={() => deleteCardsHandler(card._id)}
                                                                  sx={{mt: 3, mb: 2}}
                                                                  variant={'contained'}
                                                                  color={'error'}
                                                              >Delete</Button>
                                                          }/>
                                                <AppModal description={'Update card'} title={'Edit'} key={'10'} children={[
                                                    <TextField
                                                        className={s.input}
                                                        key={'3'}
                                                        color={'secondary'}
                                                        margin="normal"
                                                        id="question"
                                                        label="New question name"
                                                        autoFocus
                                                        helperText="Enter question name"
                                                        value={questions[index]}
                                                        onChange={(e) => {
                                                            const copyQuestions = [...questions]
                                                            copyQuestions[index] = e.currentTarget.value
                                                            setQuestions(copyQuestions)
                                                        }}
                                                    />,
                                                    <TextField
                                                        className={s.input}
                                                        key={'4'}
                                                        color={'secondary'}
                                                        margin="normal"
                                                        id="answer"
                                                        label="New answer value"
                                                        helperText="Enter answer name"
                                                        value={answers[index]}
                                                        onChange={(e) => {
                                                            const copyAnswers = [...answers]
                                                            copyAnswers[index] = e.currentTarget.value
                                                            setAnswers(copyAnswers)
                                                        }}/>,
                                                    <Button
                                                        key={'2'}
                                                        style={{borderRadius: '30px'}}
                                                        className={s.btnsEdit}
                                                        size={'small'}
                                                        sx={{mt: 3, mb: 2}}
                                                        onClick={() => updateCardsHandler(card._id, questions[index], answers[index])}
                                                        variant={'contained'}>
                                                        Edit Card
                                                    </Button>,
                                                ]}/>
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
