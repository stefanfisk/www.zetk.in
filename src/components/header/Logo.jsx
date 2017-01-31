import React from 'react';
import { Link } from 'react-router';


export default class Logo extends React.Component {
    render() {
        return (
            <Link className="Logo" to="/">
                <img src="/static/images/logo-red.png"
                    alt="Zetkin"/>
            </Link>
        );
    }
}
