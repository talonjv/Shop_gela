import Logo from "../assets/logo.jpg"
import test1 from "../assets/test1.webp"
import test2 from "../assets/test1.webp"
import test3 from "../assets/test1.webp"
import test4 from "../assets/test1.webp"
import { useState } from "react"
import { FaAngleDown } from "react-icons/fa";
import Hot from "../page/hot.jsx"
import BannerSlider from "../components/slide"
import ListSlider from "../components/slidelist"

const Home = () => {
  const img = [
    { id: 1, url: test1, name: "ao moi", price: "2300", title: "Áo Giữ nhiệt", dis: "ao moi den ae mua mac thoai mai" },
    { id: 2, url: test2, name: "ao moi", price: "2000", title: "Áo Giữ nhiệt", dis: "ao moi den ae mua mac thoai mai" },
    { id: 3, url: test3, name: "ao moi", price: "2000", title: "Áo Giữ nhiệt", dis: "ao moi den ae mua mac thoai mai" },
    { id: 4, url: test4, name: "ao moi", price: "2003", title: "Áo Giữ nhiệt", dis: "ao moi den ae mua mac thoai mai" },
  ]

  const [isOpen, setIsOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("Nữ");

  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectGender = (gender) => {
    setSelectedGender(gender);
    setIsOpen(false);
  };

  return (
    <>
      <img src={Logo} alt="" className="w-[1200px] ml-[160px]" />
      <div className="text-center mt-10">
        <h1 className="text-[40px]">Năm Mới Tiền Tới !</h1>
        <button className="border-red-300 border-solid border-2 rounded-full p-1 focus:bg-red-300">
          Săm Áo Mới
        </button>
        <button className="border-red-300 border-solid border-2 rounded-full p-1 focus:bg-red-300">
          Áo Phao Ấm Áp
        </button>
      </div>

      <div className="flex ml-[80px]">
        {img.map((item) => (
          <div key={item.id} className="w-[300px] h-[454px] p-3 relative overflow-visible shadow-md rounded-lg mt-[20px] ml-7">
            <img src={item.url} alt="" className="h-[335px] w-full rounded-lg transform transition-transform duration-300 hover:-translate-y-6 hover:shadow-lg" />
            <div>{item.name}</div>
            <div className="text-2xl">{item.price}đ</div>
          </div>
        ))}
      </div>

      <button className="ml-[540px] w-[420px] border-red-300 border-solid border-2 rounded-lg p-5 mt-5 hover:bg-red-300">
        Xem Thêm
      </button>

      {/* Nổi bật */}
      <h1 className="text-center mt-16 text-[100px]">Bộ sưu tập nổi bật</h1>
      <div className="flex ml-[80px]">
        {img.map((item) => (
          <div key={item.id} className="w-[300px] h-[494px] relative overflow-visible shadow-md rounded-lg mt-[20px] ml-7">
            <img src={item.url} alt="" className="h-[335px] w-full rounded-lg" />
            <div className="mt-4 text-[30px]">{item.title}</div>
            <div className="text-lime-500">{item.dis}</div>
            <button className="border-red-300 border-solid border-2 rounded-xl p-1 mt-8">
              Xem Thêm
            </button>
          </div>
        ))}
      </div>

      {/* Slide */}
      <BannerSlider />
      <div className="">
        <div>
          <p>Đồ nổi bật</p>
        </div>
      {/* Dropdown */}
      <div className="relative inline-block">
        <button onClick={toggleDropdown} className="flex items-center text-lg font-medium text-gray-800 ml-[735px]">
          {selectedGender}
          <span className={`ml-2 transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <FaAngleDown />
          </span>
        </button>
       
        {isOpen && (
          <div className="absolute z-10 mt-2 w-20 bg-white border rounded-lg shadow-lg left-[750px]">
            <button className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedGender === "Nữ" ? "font-bold" : ""}`}
              onClick={() => selectGender("Nữ")}>
              Nữ
            </button>
            <button className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedGender === "Nam" ? "font-bold" : ""}`}
              onClick={() => selectGender("Nam")}>
              Nam
            </button>
          </div>
        )}

</div>
        {/* Hiển thị hình ảnh */}
        <div className="mt-4 ml-14">
          <Hot />
        </div>
      </div>
      {/* List Slider */}
      <div>
        <ListSlider />
      </div>
    </>
  )
}

export default Home

