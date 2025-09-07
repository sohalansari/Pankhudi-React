import React from "react";
import "./PageContainer.css";

function PageContainer({ title, children }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{title}</h1>
            </div>
            <div className="page-content">
                {children}
            </div>
        </div>
    );
}

export default PageContainer;