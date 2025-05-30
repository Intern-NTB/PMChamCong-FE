import { Col, Row } from "antd"
import { DataGrid } from "devextreme-react"

export default function TimeOffManagerment (){
    const dataSource = {}
    return (
         <div className="container-column">
            <div className="row row-1">Quản lý nghỉ phép</div>
            <hr />
            <div className="row row-2">
               
            </div>
            <Popup
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
                initialValues={currentRecord}
            />
           
        </div>
    )
}