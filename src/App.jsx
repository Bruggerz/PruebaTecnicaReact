import React, { useEffect, useState } from 'react'
import './App.css';
import Axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from '@restart/ui/esm/Button';

import { useForm } from './helpers/useForm';
import MaterialTable from 'material-table';
import Swal from 'sweetalert2';



function App() {
  /**
   * Definición completa de hook para poder recuperar información del filtro
   * para el backend
   */
  const initialState = {
    "filtroNombre":""
  }

  const [values, handleInputChange, setValues]=useForm(initialState)

  const {filtroNombre}=values

  /**
   * Configuracion del data que guardará la información respecto 
   * a la data traida desde el backend
   */
  const [data,setData]=useState([]);


  /**
   * Definicion de columnas de Material Table
   */
  const columnas=[
    {
      title:'Restaurant',
      field:'nombre_restaurant'
    },
    {
      title:'Ubicacion',
      field:'ubicacion'
    },
    {
      title:'Comidas',
      field:'comida'
    },
    {
      title:'Valoracion',
      field:'calificacion',
      type:'number',
      validate:rowData=>isNaN(rowData)
    },
    {
      title:'Visitado',
      field:'visitado',
      type:'boolean'
    },
  ]

/**
 * Función que trae todos los datos de la base de datos
 */
  var consultaRestaurant= async()=>{
    await Axios.get('http://127.0.0.1:8000/api/restaurant').then(res=>setData(res.data))
  }

  /**
   * Función permite eliminar el elemento seleccionado dentro del row de la tabla
   * también se añade un pequeño mensaje de confirmación
   */
  const eliminacionRestaurant = (data)=>{
    Swal.fire({
      title: '¿Estas seguro que deseas eliminar el Restaurant?',
      text: "Esta accion no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
          Axios.post('http://127.0.0.1:8000/api/eliminarRestaurant', data).then(()=>{
            consultaRestaurant();
          })
      }
  })
  }

  /**
   * 
   * Función permite editar los datos en el backend
   */
  const editarRestaurant=(data)=>{
    if(isNaN(data.calificacion)){
      alert('Tipo de dato ingresado no valido, debe ser entero')
    }
    else if(data.calificacion>=0 && data.calificacion<11){
      Axios.post('http://127.0.0.1:8000/api/actualizarRestaurant',data).then(()=>{
        consultaRestaurant();
      })
    }
    else{
      alert('Valoración fuera del rango (10 puntos)')
    }
    
  }

  /**
   * Función permite crear nueva data respecto a restaurantes
   */
  const crearRestaurant = (data) => {
    const dataMod={
      ...data,
      visitado:!!data.visitado?true:false
    }
    if(isNaN(dataMod.calificacion)){
      alert('Tipo de dato ingresado no valido, debe ser entero')
    }
    else if(dataMod.calificacion>=0 && dataMod.calificacion<11){
      Axios.post('http://127.0.0.1:8000/api/insertaRestaurant',dataMod).then(()=>{
        consultaRestaurant();
      })
    }
    else{
      alert('Valoración fuera del rango (10 puntos)')
    }
    
  }

  /**
   * Permite filtrar mediante el nombre de restaurante directamente desde el backend
   */
  const filtrarPorRestaurant=()=>{
    let body={
      nombre_restaurant:filtroNombre
    }
    if(filtroNombre!=="") Axios.post('http://127.0.0.1:8000/api/filtrarRestaurante',body).then(res=>{
      if(!!res.data){
        setData(res.data)
      }  
    })
  }

  /**
   * Limpia los input y reestablece los valores predeterminado del input
   */
  const limpiarInput=()=>{
    consultaRestaurant();
    setValues(initialState)
  }
  

  /**
   * Cada vez que se genere un cambio en alguna variable, se ejecutará la funcion de consultaRestaurant
   */
  useEffect(()=>{
    consultaRestaurant();
  },[])


  return (
    <>
      <div className="offset-md-5">
        <h1>Lista de Restaurantes</h1>
      </div>
      <div className="col-2 offset-md-3">
        <h5>Filtro</h5>
        <div className="mb-3">
          <form className="form-group">
            <div className="mb-3">
              <label className="form-label">Nombre de restaurant</label>
              <input className="form-control mb-3 ml-3" type="text" name="filtroNombre" value={filtroNombre} onChange={handleInputChange} placeholder="Nombre Restaurant"></input>
            </div>
            <Button className="btn btn-success" style={{marginRight:'20px'}} onClick={()=>{filtrarPorRestaurant()}} type="button">Filtrar</Button>
            <Button className="btn btn-primary" onClick={()=>{limpiarInput()}} type="button">Limpiar</Button>
          </form>
        </div>
      </div>
      <div className="col-12">
        <div className="col-6 offset-md-3">
          <div style={{height:300, width:'100%'}}>
            <MaterialTable
              columns={columnas}
              data={data}
              title="Restaurantes"
              actions={[
                {
                    icon: 'delete',
                    tooltip: 'Eliminar Restaurant',
                    onClick: (event, rowData) => eliminacionRestaurant(rowData)
                }
            ]}
            editable={{
              onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                      try{
                        setTimeout(() => {
                          editarRestaurant(newData)
                          resolve()
                      }, 1000);
                        
                      }
                      catch(error){
                        reject(error)
                      }
                  }),
                  onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            setTimeout(() => {
                                crearRestaurant(newData)
                                resolve();
                            }, 1000);
                        }),
                }
              
              }
              localization={{
                toolbar:{
                    searchTooltip: 'Buscar',
                    searchPlaceholder: 'Buscar'
                },
                pagination:{
                    labelRowsSelect: 'filas',
                    labelDisplayedRows: '{count} de {from}-{to}',
                    firstTooltip: 'Primera pagina',
                    previousTooltip: 'Pagina anterior',
                    nextTooltip: 'Proxima pagina',
                    lastTooltip: 'Ultima pagina'
                },
                body:{
                    addTooltip:"Añadir",
                    editTooltip:'Editar',
                    editRow: {
                        cancelTooltip: 'Cancelar',
                        saveTooltip: 'Guardar Restaurant'
                    },
                    emptyDataSourceMessage: 'Sin registros para mostrar',
                },
                header:{
                    actions: 'Acciones'
                }
            }
          }
          options={{
            actionsColumnIndex:-1
          }}
              

            />
          </div>
        </div>
        
      </div>
    </>
  );
}

export default App;
