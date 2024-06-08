"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { LuParkingCircle } from "react-icons/lu";
import { PiEngineBold } from "react-icons/pi";
import { GiBatteryPackAlt } from "react-icons/gi";
import { PiBatteryVerticalLow } from "react-icons/pi";
import { FaGears } from "react-icons/fa6";
import { PiBatteryVerticalMedium } from "react-icons/pi";
import { PiBatteryVerticalEmpty } from "react-icons/pi";
import { BsThermometerHalf } from "react-icons/bs";
import { PiPlugCharging } from "react-icons/pi";

export default function Page() {
  const [vehicleData, setVehicleData] = useState<any | null>(null);
  const [motorSpeed, setMotorSpeed] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const handleInserts = (payload: any) => {
      console.log("Change received!", payload);
      setVehicleData(payload.new);
      setMotorSpeed(payload.new.motor_speed);
    };

    const channel = supabase
      .channel("vehicle_data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicle_data" },
        handleInserts
      )
      .subscribe();

    const getData = async () => {
      const { data } = await supabase.from("vehicle_data").select().single();
      setVehicleData(data);
      console.log(data);
      setMotorSpeed(data.motor_speed);
    };

    getData();

    // Clean up the subscription on component unmount
    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const updateMotorSpeed = async (speed: number) => {
    console.log("Updating motor speed to", speed);
    setMotorSpeed(speed); // Update the state immediately for UI responsiveness
    await fetch("http://localhost:3001/api/update-motor-speed", {
      // await fetch("https://evt-server-0f8f4eff5beb.herokuapp.com/api/update-motor-speed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ speed }),
    });
  };

  const resetVehicle = async () => {
    console.log("Resetting vehicle");
    await fetch("http://localhost:3001/api/reset", {
      // await fetch("https://evt-server-0f8f4eff5beb.herokuapp.com/api/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const rechargeVehicle = async () => {
    console.log("Recharging vehicle");
    await fetch("http://localhost:3001/api/recharge", {
      // await fetch("https://evt-server-0f8f4eff5beb.herokuapp.com/api/recharge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <div className="w-full px-32 py-20 max-w-[1400px]">
      <div className="flex flex-col">
        <div className="flex justify-between mb-20">
          <div className="flex gap-10">
            <div>
              <LuParkingCircle
                style={{ color: vehicleData?.parking_brake ? "red" : "gray" }}
                size={80}
              />
            </div>
            <div>
              <PiEngineBold
                style={{ color: vehicleData?.check_engine ? "red" : "gray" }}
                size={80}
              />
            </div>
            <div>
              <GiBatteryPackAlt
                style={{ color: vehicleData?.motor_status ? "red" : "gray" }}
                size={80}
              />
            </div>
            <div>
              <PiBatteryVerticalLow
                style={{ color: vehicleData?.battery_low ? "red" : "gray" }}
                size={80}
              />
            </div>
          </div>
          <div className="flex justify-center ">
            <button
              className="px-10 py-2 uppercase border-4 border-white rounded-md text-[30px]"
              onClick={resetVehicle}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="flex justify-between mx-auto mb-20 gap-80">
          <div className="flex flex-col items-center gap-10 text-5xl font-bold">
            <div>Power</div>
            <div>{vehicleData?.power}</div>
            <div>kW</div>
          </div>
          <div className="flex flex-col items-center gap-10 text-5xl font-bold">
            <div>Motor</div>
            <div>{vehicleData?.motor_rpm}</div>
            <div>RPM</div>
          </div>
        </div>
        <div className="flex justify-between mb-20">
          <div className="flex gap-14">
            <div className="items-center justify-center">
              <FaGears size={80} />
              <div className="text-center">N/N</div>
            </div>
            <div className="items-center justify-center">
              <PiBatteryVerticalMedium className="mb-2" size={80} />
              <div className="text-center">
                {vehicleData?.battery_percent + " " + "%"}
              </div>
            </div>
            <div className="items-center justify-center">
              <div className="flex gap-0 mb-2">
                <PiBatteryVerticalEmpty size={80} />
                <BsThermometerHalf className="-ml-10" size={80} />
              </div>
              <div className="text-center">{vehicleData?.battery_temp}°C</div>
            </div>
            <div className="items-center justify-center">
              <GiBatteryPackAlt className="mb-2" size={80} />
              <div className="text-center">
                {vehicleData?.motor_rpm + " " + "RPM"}
              </div>
            </div>
          </div>
          <div className="w-[40%]">
            <div className="mb-5 text-xl font-semibold text-center uppercase">
              Motor Speed Setting
            </div>

            <div>
              <input
                className="w-full"
                type="range"
                min="0"
                max="4"
                value={motorSpeed}
                onChange={(e) => updateMotorSpeed(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between">
              <div className="-ml-4">OFF</div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-end">
          <PiPlugCharging
            className="cursor-pointer"
            size={100}
            onClick={rechargeVehicle}
          />
        </div>
      </div>
      <pre className="mt-40">{JSON.stringify(vehicleData, null, 2)}</pre>
    </div>
  );
}
