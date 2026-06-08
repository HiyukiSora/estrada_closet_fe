import React from 'react'

export const ItemImage = ({ image }) => {
    return (
        <React.Fragment>
            <div
                style={{
                    width: 52,
                    height: 64,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1.5px solid rgba(0,0,0,0.06)",
                    background: "#f5f0eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <span style={{ fontSize: 18 }}>👗</span>
                )}
            </div>
        </React.Fragment>
    )
}
