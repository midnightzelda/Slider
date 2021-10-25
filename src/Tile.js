import React from "react";
import { getMatrixPosition, getVisualPosition } from "./helpers";
import { TILE_COUNT, GRID_SIZE } from "./constants"

function Tile(props) {
    const { tile, index, width, height } = props;

    const { row, col } = getMatrixPosition(index);
    const visualPos = getVisualPosition(row, col, width, height);
    const tileStyle = {
        width `calc(100% / ${GRID_SIZE})`,
        height `calc(100% / ${GRID_SIZE})`,
        translateX: visualPos.x,
        translateY: visualPos.y,
    };
    return(
        1
    )
}