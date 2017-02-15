import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';
import { connect } from 'react-redux';

import LoadingIndicator from '../../common/misc/LoadingIndicator';
import { survey } from '../../store/surveys';
import { organization } from '../../store/orgs';
import { retrieveSurvey } from '../../actions/survey';


const mapStateToProps = (state, props) => {
    let s = survey(state, props.params.surveyId);
    let o = s? organization(state, s.get('organization_id')) : null;

    return {
        survey: s,
        organization: o,
    };
}

@connect(mapStateToProps)
export default class SurveyPage extends React.Component {
    componentDidMount() {
        let orgId = this.props.params.orgId;
        let surveyId = this.props.params.surveyId;

        if (!this.props.survey) {
            this.props.dispatch(retrieveSurvey(orgId, surveyId));
        }
    }

    render() {
        let survey = this.props.survey;
        let surveyInfo;
        let form = null;

        if (survey && survey.get('isPending')) {
            surveyInfo = <LoadingIndicator />;
        }
        else if (!survey || survey.get('error')) {
            surveyInfo = <Msg id="pages.survey.notFound.h"/>;
        }
        else if (survey) {
            surveyInfo = [
                <h2 key="title">{ survey.get('title') }</h2>,
                <span key="org" className="SurveyPage-infoOrg">
                    { this.props.organization.get('title') }
                </span>,
                <p key="infoText">
                    { survey.get('info_text') }
                </p>
            ];

            form = null;
        }

        return (
            <div className="SurveyPage">
                <div className="SurveyPage-info">
                    { surveyInfo }
                </div>
                { form }
            </div>
        );
    }

    onResponse(action, checked) {
        this.props.dispatch(updateActionResponse(action, checked));
    }
}
