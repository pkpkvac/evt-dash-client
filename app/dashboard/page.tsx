"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

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
    <div>
      <pre>{JSON.stringify(vehicleData, null, 2)}</pre>
      <input
        type="range"
        min="0"
        max="4"
        value={motorSpeed}
        onChange={(e) => updateMotorSpeed(Number(e.target.value))}
      />
      <button onClick={resetVehicle}>Reset</button>
      <button onClick={rechargeVehicle}>Recharge</button>
    </div>
  );
}
