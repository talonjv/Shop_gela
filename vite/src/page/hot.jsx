// import Navbar from "../layout/navbar"
import Male from '../data.json';
import { Link } from 'react-router';
import { FaCartArrowDown } from "react-icons/fa";
const Hot = () => {
  return (
    <div>
      {/* <Navbar/> */}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 ml-[50px] mt-[20px]'>
        {Male.Male.map((x) => (
          <div key={x.id} >
            <div className="w-[300px] h-[354px] p-3 bg-gray-100 relative overflow-visible shadow-md rounded-lg mt-[20px]">
              {/* Image Section */}

              <img src={x.bo} alt="" className="h-[250px] w-full rounded-lg transform transition-transform duration-300 hover:-translate-y-6 hover:shadow-lg" />

              {/* Info Section */}
              <div className="pt-4">
                <p className="font-bold text-lg leading-snug"><Link to={x.name}>{x.name} </Link></p>

              </div>

              {/* Footer Section */}
              <div className="w-full flex justify-between items-center border-t border-gray-300 p-1 ">
                <span className="font-bold text-lg">{x.price}</span>
                <button className="flex items-center justify-center p-2 border border-black rounded-full hover:border-orange-300 hover:bg-orange-300 transition-all">
                  <Link to=""> <FaCartArrowDown size={24} className="" /></Link>
                </button>
              </div>
            </div>

          </div>

        ))}
      </div>
    </div>
  )
}

export default Hot
