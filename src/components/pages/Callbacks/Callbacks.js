import React, { useEffect } from 'react';
import { CallbacksTabs } from './CallbacksTabs';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import { makeStyles } from '@material-ui/core/styles';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import TocIcon from '@material-ui/icons/Toc';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { HeightsDialog } from './HeightsDialog';
import { MythicDialog } from '../../MythicComponents/MythicDialog';
import { CallbacksTop } from './CallbacksTop';

const useStyles = makeStyles((theme) => ({
    root: {
        transform: 'translateZ(0px)',
        flexGrow: 1,
    },
    speedDial: {
        position: 'absolute',
        '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
        '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
            top: theme.spacing(2),
            right: theme.spacing(2),
        },
    },
    tooltip: {
        backgroundColor: theme.palette.background.contrast,
        color: theme.palette.text.contrast,
        boxShadow: theme.shadows[1],
        fontSize: 13,
    },
    arrow: {
        color: theme.palette.background.contrast,
    },
}));
export function Callbacks() {
    const [topDisplay, setTopDisplay] = React.useState('table');
    const [openTabs, setOpenTabs] = React.useState([]);
    const [clickedTabId, setClickedTabId] = React.useState('');
    const [heights, setHeights] = React.useState({ top: '30%', bottom: '68%' });
    useEffect(() => {
        const oldTabs = localStorage.getItem('openTabs');
        if (oldTabs !== undefined && oldTabs !== null) {
            try {
                const tabs = JSON.parse(oldTabs);
                setOpenTabs(tabs);
                const lastClickedTab = localStorage.getItem('clickedTab');
                if (lastClickedTab !== undefined && lastClickedTab !== null) {
                    setClickedTabId(lastClickedTab);
                }
            } catch (error) {
                console.log('failed to parse oldTabs', error);
            }
        }
        const oldHeights = localStorage.getItem('heights');
        if (oldHeights !== undefined && oldHeights !== null) {
            try {
                const newHeights = JSON.parse(oldHeights);
                setHeights(newHeights);
            } catch (error) {
                console.log('failed to parse oldHeights', error);
            }
        }
    }, []);
    const onOpenTab = (tabData) => {
        let found = false;
        openTabs.forEach((tab) => {
            if (tab.tabID === tabData.tabID) found = true;
        });
        //console.log("found is", found, tabData.tabID, tabData.tabType, tabData.callbackID, openTabs);
        if (!found) {
            const tabs = [...openTabs, { ...tabData }];
            localStorage.setItem('openTabs', JSON.stringify(tabs));
            setOpenTabs(tabs);
        }
        localStorage.setItem('clickedTab', tabData.tabID);
        setClickedTabId(tabData.tabID);
    };
    const onEditTabDescription = (tabInfo, description) => {
        const tabs = openTabs.map((t) => {
            if (t.tabID === tabInfo.tabID) {
                return { ...t, customDescription: description };
            } else {
                return { ...t };
            }
        });
        setOpenTabs(tabs);
        localStorage.setItem('openTabs', JSON.stringify(tabs));
    };
    const onCloseTab = ({ tabID, index }) => {
        const tabSet = openTabs.filter((tab) => {
            return tab.tabID !== tabID;
        });
        localStorage.setItem('openTabs', JSON.stringify(tabSet));
        setOpenTabs(tabSet);
    };
    const clearSelectedTab = React.useCallback(() => {
        setClickedTabId('');
    }, []);

    const onSubmitHeights = React.useCallback((newHeights) => {
        setHeights(newHeights);
        localStorage.setItem('heights', JSON.stringify(newHeights));
    }, []);
    return (
        <div style={{ maxWidth: '100%', height: '100%',  display: 'flex', flexDirection: 'column' }}>
            <React.Fragment>
                <SpeedDialWrapper setTopDisplay={setTopDisplay} heights={heights} onSubmitHeights={onSubmitHeights} />
                <div style={{ flexGrow: 1, flexBasis: heights.top, height: heights.top }}>
                    <CallbacksTop topDisplay={topDisplay} onOpenTab={onOpenTab} heights={heights} />
                </div>
                <div style={{ flexGrow: 1, flexBasis: heights.bottom, height: heights.bottom }}>
                    <CallbacksTabs
                        onCloseTab={onCloseTab}
                        onEditTabDescription={onEditTabDescription}
                        clearSelectedTab={clearSelectedTab}
                        tabHeight={heights.bottom}
                        maxHeight={heights.bottom}
                        key={'callbackstabs'}
                        clickedTabId={clickedTabId}
                        openTabs={openTabs}
                    />
                </div>
            </React.Fragment>
        </div>
    );
}

function SpeedDialWrapperPreMemo({ setTopDisplay, onSubmitHeights, heights }) {
    const [open, setOpen] = React.useState(false);
    const classes = useStyles();
    const [openHeightsDialog, setOpenHeightsDialog] = React.useState(false);
    const submitHeights = (newHeights) => {
        setOpen(false);
        onSubmitHeights(newHeights);
    };
    const actions = React.useMemo(
        () => [
            {
                icon: <TocIcon />,
                name: 'Table layout',
                onClick: () => {
                    setTopDisplay('table');
                },
            },
            {
                icon: <AssessmentIcon />,
                name: 'Graph layout',
                onClick: () => {
                    setTopDisplay('graph');
                },
            },
            {
                icon: <AspectRatioIcon />,
                name: 'Adjust Top/Bottom Size',
                onClick: () => {
                    setOpenHeightsDialog(true);
                    setOpen(false);
                },
            },
        ],
        []
    );
    return (
        <React.Fragment>
            {openHeightsDialog && (
                <MythicDialog
                    fullWidth={true}
                    maxWidth='sm'
                    open={openHeightsDialog}
                    onClose={() => {
                        setOpenHeightsDialog(false);
                        setOpen(false);
                    }}
                    innerDialog={
                        <HeightsDialog
                            onClose={() => {
                                setOpenHeightsDialog(false);
                                setOpen(false);
                            }}
                            heights={heights}
                            onSubmit={submitHeights}
                        />
                    }
                />
            )}
            <SpeedDial
                ariaLabel='SpeedDial example'
                className={classes.speedDial}
                icon={<SpeedDialIcon />}
                onClose={() => {
                    setOpen(false);
                }}
                onOpen={() => {
                    setOpen(true);
                }}
                FabProps={{ color: 'secondary' }}
                open={open}
                style={{ marginTop: '35px' }}
                direction='down'>
                {actions.map((action) => (
                    <SpeedDialAction
                        arrow
                        key={action.name}
                        TooltipClasses={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onClick}
                    />
                ))}
            </SpeedDial>
        </React.Fragment>
    );
}
const SpeedDialWrapper = React.memo(SpeedDialWrapperPreMemo);