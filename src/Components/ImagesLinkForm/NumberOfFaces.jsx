import React from 'react';

const NumberOfFaces = ({boxes}) => {
    return (
        <div>
            <p className='f3'>
				{`There are ${boxes.length} faces`}
			</p>
		</div>
    );
}

export default NumberOfFaces;