import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';

import FormattedLink from '../../../common/misc/FormattedLink';

export default class ConnectLink extends React.Component {
    render() {
        const {isAuthenticated, isMember, orgItem} = this.props;
        let connectLink = null;

        if (orgItem) {
            if (isMember) {
                connectLink = (
                    <span className="ConnectLink-connected">
                        <Msg id="pages.orgPage.connect.alreadyConnected" 
                    className="ConnectLink-connected"/>
                    </span>
                );
            }
            else if (isAuthenticated) {
                let connectHref = '/o/' + orgItem.get('id') + '/connect';
                connectLink = (
                    <FormattedLink href={ connectHref } forceRefresh={ true }
                        msgId="pages.orgPage.connect.connectLink"
                        msgValues={{ org: orgItem.get('title') }}
                        className="ConnectLink"
                        />
                );
            }
            else {
                const loginUrl = '/ops/orgConnect/'
                    + orgItem.get('id')
                    + '?onComplete=' + '/o/' + orgItem.get('id');

                connectLink = (
                    <FormattedLink msgId="pages.orgPage.connect.login"
                        href={ loginUrl } forceRefresh={ true }
                        className="ConnectLink"
                        />
                );
            }
        }
        

        return connectLink;
    }
}
