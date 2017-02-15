import express from 'express';
import immutable from 'immutable';

import { configureStore } from '../store';
import { createLocalizeHandler } from './locale';
import { setUserData } from '../actions/user';
import { retrieveAllCampaigns } from '../actions/campaign';
import { retrieveUserAssignments } from '../actions/callAssignment';
import { retrieveUserMemberships } from '../actions/org';
import { retrieveCampaign } from '../actions/campaign';
import { retrieveSurvey } from '../actions/survey';
import {
    retrieveAllActions,
    retrieveCampaignActions,
    retrieveUserActions,
    retrieveUserResponses,
} from '../actions/action';


export default (messages) => {
    const preloader = express();
    const localizeHandler = createLocalizeHandler(messages);

    // TODO: Change scope depending on URL
    preloader.use(localizeHandler());

    // TODO: Rearrange so that this can be on top
    //       Right now it relies on the intl data from localizeHandler()
    preloader.use(initStore);

    preloader.get('*', waitForActions(req => [
        retrieveUserMemberships(),
    ]));

    preloader.get('/dashboard', waitForActions(req => [
        retrieveAllCampaigns(),
        retrieveAllActions(),
        retrieveUserActions(),
        retrieveUserAssignments(),
        retrieveUserResponses(),
    ]));

    preloader.get('/o/:orgId/campaigns/:campaignId', waitForActions(req => [
        retrieveCampaign(req.params.orgId, req.params.campaignId),
        retrieveCampaignActions(req.params.orgId, req.params.campaignId),
        retrieveUserActions(),
        retrieveUserResponses(),
    ]));

    preloader.get('/o/:orgId/surveys/:surveyId', waitForActions(req => [
        retrieveSurvey(req.params.orgId, req.params.surveyId),
    ]));

    return preloader;
}

function initStore(req, res, next) {
    let initialState = immutable.fromJS({
        intl: {
            locale: req.intl.locale,
            messages: req.intl.messages,
        },
    });

    req.store = configureStore(initialState, req.z);

    req.z.resource('users', 'me').get()
        .then(apiRes => {
            console.log('Retrieved user data', apiRes);
            req.store.dispatch(setUserData(apiRes.data.data));

            if (apiRes.data.data.is_verified || req.path == '/verify') {
                next();
            }
            else {
                // Redirect unverified users
                res.redirect('/verify');
            }
        })
        .catch(err => {
            console.log('Could not retrieve user', err);
            next();
        });
}

function waitForActions(execActions) {
    return (req, res, next) => {
        let thunksOrActions = execActions(req);
        let promises = [];

        for (let i = 0; i < thunksOrActions.length; i++) {
            let thunkOrAction = thunksOrActions[i];
            if (typeof thunkOrAction === 'function') {
                // Invoke thunk method, passing an augmented store where the
                // dispatch method has been replaced with a method that also
                // saves the dispatched action to be inspected for promises.
                thunkOrAction({
                    ...req.store,
                    z: req.z,
                    dispatch: function(action) {
                        thunkOrAction = action;
                        req.store.dispatch(thunkOrAction);
                    }
                });
            }

            if (thunkOrAction.payload && thunkOrAction.payload.promise) {
                promises.push(thunkOrAction.payload.promise);
            }
        }

        Promise.all(promises)
            .then(() => next())
            .catch(() => next());
    };
}
