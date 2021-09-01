import React from 'react'


class Result extends React.Component {
    render() {
        return <div>
            <p>{this.props.number+1} место: {this.props.res} </p>
        </div>
    }
}
export default Result