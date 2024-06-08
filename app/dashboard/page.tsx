"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
  const [vehicleData, setVehicleData] = useState<any[] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleInserts = (payload) => {
      console.log("Change received!", payload);
      setVehicleData(() => {
        return [payload.new];
      });
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
      const { data } = await supabase.from("vehicle_data").select();
      setVehicleData(data);
    };

    getData();

    // Clean up the subscription on component unmount
    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  return <pre>{JSON.stringify(vehicleData, null, 2)}</pre>;
}
