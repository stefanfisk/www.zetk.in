import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';

import FormattedLink from '../../common/misc/FormattedLink';
import LoadingIndicator from '../../common/misc/LoadingIndicator';
import OrgAvatar from '../misc/OrgAvatar';


export default class ConnectionList extends React.Component {
    render() {
        let content = null;

        if (this.props.connectionList.isPending) {
            content = <LoadingIndicator />;
        }
        else {
            let list = this.props.connectionList;
            let items;

            if (list.get('items').size) {
                items = list.get('items').toList().map(i => {
                    let roleMsg = 'misc.connectionList.roles.' + (i.get('role') || 'none');
                    let org = i.get('organization');

                    return (
                        <li key={ org.get('id') } className="ConnectionList-item">
                            <OrgAvatar orgId={ org.get('id') }/>
                            <h3>{ org.get('title') }</h3>
                            <p className="ConnectionList-itemRole">
                                <Msg id={ roleMsg }/>
                            </p>
                            <FormattedLink msgId="misc.connectionList.deleteLink"
                                onClick={ this.onDeleteLinkClick.bind(this, org) }
                                />
                        </li>
                    );
                });
            }
            else {
                items = (
                    <div className="ConnectionList-empty">
                        <Msg id="misc.connectionList.empty"/>
                    </div>
                );
            }

            content = (
                <ul className="ConnectionList-list">
                    { items }
                </ul>
            );
        }

        return (
            <div className="ConnectionList">
                { content }
            </div>
        );
    }

    onDeleteLinkClick(org) {
        if (this.props.onDisconnect) {
            this.props.onDisconnect(org);
        }
    }
}